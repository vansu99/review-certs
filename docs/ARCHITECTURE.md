# Architecture

This document describes the system architecture, technical decisions, data flow, and component relationships in the Review Certs platform.

---

## System Overview

Review Certs is a monorepo containing two independent applications that communicate over HTTP:

```mermaid
graph LR
    subgraph Browser
        SPA[React SPA]
    end

    subgraph Docker Network
        API[Express.js API :3000]
        DB[(MySQL 8.0 :3306)]
    end

    SPA -->|REST API / JSON| API
    API -->|mysql2 pool| DB
```

---

## Technology Decisions

### Why React 19 + Vite?

- React 19 brings performance improvements and concurrent features
- Vite provides near-instant HMR and fast builds (esbuild + Rollup)
- TypeScript for type safety across the frontend
- TanStack Query for server-state management with caching, deduplication, and background refetching

### Why Express.js (not Fastify, NestJS)?

- Lightweight, minimal opinion — fits a CRUD-heavy API well
- Massive ecosystem of middleware
- Team familiarity
- Low overhead for a project of this scale

### Why MySQL (not PostgreSQL, MongoDB)?

- Relational data model fits the domain (categories → tests → questions → options)
- Strong referential integrity (CASCADE deletes)
- Good JSON column support for flexible fields (selected_option_ids)
- MySQL 8.0 supports CTEs, window functions, and JSON operations

### Why raw SQL (not Prisma, TypeORM, Knex)?

- Full control over query optimization
- No ORM abstraction leakage
- Simpler deployment (no schema generation step)
- Trade-off: more boilerplate, harder to maintain

---

## Data Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ TEST_ATTEMPTS : takes
    USERS ||--o{ GOALS : sets
    USERS ||--o{ BOOKMARKS : saves
    USERS ||--o{ BLOGS : writes
    USERS ||--o{ GROUP_MEMBERS : joins

    CATEGORIES ||--o{ TESTS : contains
    TESTS ||--o{ QUESTIONS : has
    QUESTIONS ||--o{ ANSWER_OPTIONS : has
    TESTS ||--o{ TEST_ATTEMPTS : generates

    TEST_ATTEMPTS ||--o{ TEST_ATTEMPT_ANSWERS : records

    GROUPS ||--o{ GROUP_MEMBERS : has
    GROUPS ||--o{ GROUP_EXAMS : assigns
    GROUPS ||--o{ GROUP_DISCUSSIONS : hosts
    GROUPS ||--o{ GROUP_GOALS : tracks

    BLOGS ||--o{ BLOG_LIKES : receives
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| UUID primary keys | Avoid sequential ID enumeration, safe for distributed systems |
| Soft deletes (`deleted_at`) | Preserve data integrity, enable recovery, maintain referential consistency |
| JSON column for `selected_option_ids` | Flexible storage for variable-length answer arrays |
| Separate `test_attempt_answers` table | Enables per-question analytics and detailed result review |

---

## Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Server
    participant DB as MySQL

    C->>A: POST /api/auth/login {email, password}
    A->>DB: SELECT user WHERE email = ?
    DB-->>A: user row (with password_hash)
    A->>A: bcrypt.compare(password, hash)
    A->>A: jwt.sign({id, email, name, role})
    A-->>C: {user, accessToken}

    Note over C: Store token in localStorage

    C->>A: GET /api/tests/:id (Authorization: Bearer <token>)
    A->>A: jwt.verify(token) → req.user
    A->>A: RBAC check (role in allowedRoles?)
    A->>DB: SELECT test + questions + options
    DB-->>A: results
    A-->>C: {success: true, data: {...}}
```

### Token Strategy

- **Type:** JWT (stateless)
- **Storage:** localStorage (client)
- **Expiry:** 7 days (configurable via `JWT_EXPIRES_IN`)
- **Payload:** `{ id, email, name, role }`
- **Refresh:** Not implemented (token re-issued on login)

---

## API Design Principles

### Response Format

All API responses follow a consistent envelope:

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Paginated
{ "data": [...], "total": 42, "page": 1, "pageSize": 10, "totalPages": 5 }

// Error
{ "success": false, "message": "...", "statusCode": 400 }
```

### URL Conventions

| Pattern | Example | Description |
|---------|---------|-------------|
| `GET /api/{resource}` | `/api/categories` | List resources |
| `GET /api/{resource}/:id` | `/api/tests/:id` | Get single resource |
| `POST /api/{resource}` | `/api/tests` | Create resource |
| `PUT /api/{resource}/:id` | `/api/tests/:id` | Update resource |
| `DELETE /api/{resource}/:id` | `/api/tests/:id` | Soft-delete resource |
| `POST /api/{resource}/:id/{action}` | `/api/groups/:id/reset` | Custom action |

---

## Frontend Architecture

### Component Hierarchy

```mermaid
graph TD
    App --> ErrorBoundary
    ErrorBoundary --> QueryClientProvider
    QueryClientProvider --> RouterProvider

    RouterProvider --> PublicLayout
    RouterProvider --> ProtectedRoute
    ProtectedRoute --> MainLayout

    MainLayout --> Sidebar
    MainLayout --> PageContent

    PageContent --> Pages
    Pages --> FeatureComponents
    FeatureComponents --> UIComponents
```

### State Management Strategy

| State Type | Tool | Example |
|-----------|------|---------|
| Server state (API data) | TanStack Query | Tests, categories, history |
| Auth state (persistent) | Zustand + localStorage | User session, token |
| UI state (permission config) | Zustand | Role permissions matrix |
| Form state | react-hook-form + Zod | Login form, test creation |
| Local component state | useState/useReducer | Modal open, active tab |

### Feature Module Structure

Each feature in `src/features/` follows this internal pattern:

```
features/{feature}/
├── components/      # Feature-specific UI components
├── hooks/           # Custom hooks (useQuery wrappers)
├── services/        # API call functions
├── store/           # Zustand store (if needed)
├── utils/           # Feature-specific helpers
└── index.ts         # Public API (barrel export)
```

---

## Data Flow: Test Submission

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant TQ as TanStack Query
    participant API as Express Controller
    participant DB as MySQL

    U->>TQ: mutation.mutate({testId, answers})
    TQ->>API: POST /api/tests/submit
    API->>DB: SELECT test + questions + correct options
    DB-->>API: question data
    API->>API: Calculate score (compare answers)
    API->>DB: INSERT test_attempt
    API->>DB: INSERT test_attempt_answers (per question)
    DB-->>API: success
    API-->>TQ: {attempt, test, correctAnswerMap}
    TQ-->>U: Navigate to result page
```

---

## Deployment Architecture

### Docker Compose (Current)

```mermaid
graph TB
    subgraph Docker Host
        subgraph app-network
            API[API Container<br/>Node.js :3000]
            DB[MySQL Container<br/>:3306]
        end
        VOL[(mysql_data volume)]
    end

    API -->|TCP| DB
    DB --- VOL
    Client[Browser] -->|HTTP :3000| API
```

### Production Recommendations

```mermaid
graph TB
    subgraph Cloud
        LB[Load Balancer / Nginx]
        subgraph App Tier
            API1[API Instance 1]
            API2[API Instance 2]
        end
        subgraph Data Tier
            DB[(Managed MySQL<br/>RDS / Cloud SQL)]
            Redis[(Redis Cache)]
        end
        CDN[CDN / Static Hosting]
    end

    User -->|HTTPS| CDN
    User -->|HTTPS /api| LB
    LB --> API1
    LB --> API2
    API1 --> DB
    API2 --> DB
    API1 --> Redis
    CDN -->|Static SPA| User
```

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS (enforced in production) |
| Authentication | JWT Bearer tokens |
| Authorization | Role-based (Admin, Manager, User) |
| Password Storage | bcrypt (salt rounds = 10) |
| SQL Injection | Parameterized queries (mysql2 placeholders) |
| Data Deletion | Soft delete (reversible) |
| Secrets | Environment variables (no hardcoded secrets in code) |

---

## Known Limitations

1. **No refresh token** — users must re-login after 7 days
2. **No file upload** — avatars and images are URL-only
3. **No real-time features** — no WebSocket/SSE
4. **Single database** — no read replicas or sharding
5. **No caching layer** — every request hits MySQL
6. **No background jobs** — all processing is synchronous in the request cycle
