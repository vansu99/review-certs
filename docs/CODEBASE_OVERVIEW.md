# Codebase Overview

A high-level walkthrough of the Review Certs codebase for developers onboarding to the project.

---

## Project Layout

```
review-certs/
├── client/          → React 19 + Vite frontend (TypeScript)
├── server/          → Express.js REST API (ES modules, JavaScript)
├── docs/            → Documentation
└── docker-compose.yml
```

The project is a **monorepo** with two independent packages (client and server). They share no code at runtime — the client communicates with the server exclusively via HTTP/JSON.

---

## Backend (server/)

### Entry Point

`server/src/index.js` — Sets up Express, registers middleware, mounts routes, connects to the database, and starts listening.

### Request Lifecycle

```
Incoming HTTP Request
  → cors()
  → express.json()
  → Route matcher
    → authenticate (JWT verification)
    → authorize (RBAC check)
    → Controller function
      → Database query (mysql2 pool)
      → Response helper (successResponse / errorResponse)
  → errorHandler (global catch-all)
```

### Key Directories

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/config/` | Database pool configuration | `database.js` |
| `src/controllers/` | Request handlers (business logic + DB queries) | 10 controller files |
| `src/middleware/` | Cross-cutting concerns | `auth.js`, `rbac.js`, `errorHandler.js` |
| `src/routes/` | URL → controller mapping | 10 route files |
| `src/utils/` | Shared helpers | `response.js` |
| `database/` | Schema, migrations, seeds, setup scripts | `schema.sql`, `seed.sql`, `setup.js` |

### Controller Pattern

Every controller follows the same shape:

```javascript
export async function actionName(req, res, next) {
  try {
    // 1. Extract input from req.params / req.body / req.query
    // 2. Validate (manual checks)
    // 3. Execute SQL via pool.execute()
    // 4. Transform result
    // 5. Return via successResponse() or errorResponse()
  } catch (error) {
    next(error)  // → global error handler
  }
}
```

### Domain Modules

| Module | Routes | Controller | Description |
|--------|--------|------------|-------------|
| Auth | `/api/auth` | `auth.controller.js` | Login, logout, profile CRUD |
| Categories | `/api/categories` | `category.controller.js` | CRUD categories + test listing |
| Tests | `/api/tests` | `test.controller.js` | CRUD tests, submit answers |
| History | `/api/history`, `/api/attempts` | `history.controller.js` | User attempt history, attempt detail |
| Goals | `/api/goals` | `goal.controller.js` | Personal learning goals |
| Bookmarks | `/api/bookmarks` | `bookmark.controller.js` | Save/unsave tests |
| Dashboard | `/api/dashboard` | `dashboard.controller.js` | Stats, activity, heatmap, streaks |
| Groups | `/api/groups` | `group.controller.js` | Study groups, members, exams, discussions |
| Blogs | `/api/blogs` | `blog.controller.js` | Public + managed blog CRUD |
| Analytics | `/api/analytics` | `analytics.controller.js` | Score trends, category stats |

---

## Frontend (client/)

### Entry Point

`client/src/main.tsx` → Renders `<App />` into the DOM.

`client/src/app/App.tsx` → Wraps the application in:
1. `ErrorBoundary` (global crash handling)
2. `QueryClientProvider` (TanStack Query)
3. `RouterProvider` (react-router-dom v7)
4. `Toaster` (sonner notifications)

### Routing

`client/src/app/router.tsx` defines all routes using `createBrowserRouter`:

- **Public routes:** `/login`, `/blog`, `/blog/:slug`
- **Protected routes:** Everything else (wrapped in `<ProtectedRoute />`)
- **Admin-only:** `/settings/permissions`
- **Fullscreen:** `/test/:id/exam` (no sidebar)

### State Management

| Store | Library | Location | Purpose |
|-------|---------|----------|---------|
| Auth Store | Zustand (persisted) | `features/auth/store/` | User session, token |
| Permission Store | Zustand | `features/auth/store/` | Dynamic role-permission mapping |
| Server State | TanStack Query | `features/*/hooks/` | API data with caching |

### Feature Modules

Each feature is self-contained in `src/features/{name}/`:

```
features/tests/
├── components/      # TestCard, QuestionView, etc.
├── hooks/           # useTest(), useSubmitTest(), useTests()
├── services/        # API call functions using axiosInstance
├── utils/           # Score calculation helpers
└── index.ts         # Re-exports public API
```

Features export only what pages need. Pages (`src/pages/`) compose feature hooks and components.

### UI Component Library

The project uses **shadcn/ui** (Radix UI primitives + Tailwind styling):

- Components live in `src/components/ui/`
- Pre-built: Button, Dialog, Select, Table, Alert, Badge, Form, etc.
- Customized via Tailwind + `class-variance-authority`
- `cn()` utility for conditional class merging (`clsx` + `tailwind-merge`)

### API Communication

`src/lib/axios.ts` provides a configured Axios instance with:

- Base URL from environment
- Request interceptor: attaches JWT token from localStorage
- Response interceptor: handles 401 (redirect to login), 403, 5xx errors
- Custom `ApiError` class for typed error handling

TanStack Query hooks wrap these calls with caching and mutation handling:

```typescript
// Typical pattern in features/tests/hooks/useTest.ts
export function useTest(id: string) {
  return useQuery({
    queryKey: ['tests', id],
    queryFn: () => testService.getById(id),
  })
}
```

---

## Database

### Schema Design

- **UUID** primary keys (VARCHAR(36))
- **Soft deletes** via `deleted_at TIMESTAMP NULL`
- **Timestamps** on all tables (`created_at`, `updated_at`)
- **Foreign keys** with CASCADE delete
- **Indexes** on frequently queried columns (user_id, test_id, email)

### Key Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles |
| `categories` | Test categories (e.g., "AWS", "JavaScript") |
| `tests` | Exam definitions (title, duration, passing score) |
| `questions` | Questions belonging to a test |
| `answer_options` | Answer choices for each question |
| `test_attempts` | A user's completed exam session |
| `test_attempt_answers` | Individual question answers per attempt |
| `goals` | Personal learning targets |
| `bookmarks` | Saved tests |
| `groups` | Study groups |
| `group_members` | Group membership |
| `group_exams` | Mandatory exams assigned to a group |
| `blogs` | Blog posts |
| `blog_likes` | Like tracking (user or guest fingerprint) |

---

## Development Workflow

1. **Start the backend:** `cd server && npm run dev` (nodemon auto-reloads)
2. **Start the frontend:** `cd client && npm run dev` (Vite HMR)
3. **Make changes** — frontend hot-reloads instantly, backend restarts on save
4. **Lint frontend:** `cd client && npm run lint`
5. **Build frontend:** `cd client && npm run build`

---

## Key Libraries & Their Roles

### Backend

| Package | Role |
|---------|------|
| `express` | HTTP server framework |
| `mysql2/promise` | MySQL driver with connection pooling |
| `jsonwebtoken` | JWT creation and verification |
| `bcryptjs` | Password hashing |
| `uuid` | UUID generation for primary keys |
| `cors` | Cross-Origin Resource Sharing |
| `dotenv` | Environment variable loading |

### Frontend

| Package | Role |
|---------|------|
| `react` + `react-dom` | UI rendering |
| `react-router-dom` | Client-side routing |
| `@tanstack/react-query` | Server state management |
| `zustand` | Client state management |
| `axios` | HTTP client |
| `zod` | Form validation schemas |
| `react-hook-form` | Form state and validation |
| `recharts` | Charts and visualizations |
| `@tiptap/*` | Rich text editor (blog) |
| `tailwindcss` | Utility-first CSS |
| `lucide-react` | Icon library |
| `sonner` | Toast notifications |
| `date-fns` | Date utilities |
