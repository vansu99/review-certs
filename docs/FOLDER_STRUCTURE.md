# Folder Structure

Detailed breakdown of the project directory layout and the purpose of each file and folder.

---

## Root

```
review-certs/
├── client/              # Frontend application
├── server/              # Backend API
├── docs/                # Documentation
├── .gitignore           # Git ignore rules
├── docker-compose.yml   # Container orchestration
├── DOCKER_GUIDE.md      # Docker usage guide (Vietnamese)
└── README.md            # Project overview
```

---

## Server (`server/`)

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection pool setup
│   │
│   ├── controllers/
│   │   ├── analytics.controller.js   # Score trends, category performance
│   │   ├── auth.controller.js        # Login, logout, profile
│   │   ├── blog.controller.js        # Blog CRUD + public endpoints
│   │   ├── bookmark.controller.js    # Save/unsave tests
│   │   ├── category.controller.js    # Category CRUD
│   │   ├── dashboard.controller.js   # Stats, heatmap, streaks
│   │   ├── goal.controller.js        # Learning goals
│   │   ├── group.controller.js       # Groups, members, exams, discussions
│   │   ├── history.controller.js     # Test attempt history
│   │   └── test.controller.js        # Test CRUD + submit answers
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT verification + token generation
│   │   ├── errorHandler.js      # Global error handler + ApiError class
│   │   └── rbac.js              # Role-based access control
│   │
│   ├── routes/
│   │   ├── analytics.routes.js
│   │   ├── auth.routes.js
│   │   ├── blog.routes.js
│   │   ├── bookmark.routes.js
│   │   ├── category.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── goal.routes.js
│   │   ├── group.routes.js
│   │   ├── history.routes.js
│   │   └── test.routes.js
│   │
│   ├── utils/
│   │   └── response.js          # successResponse, errorResponse, paginatedResponse
│   │
│   └── index.js                 # Application entry point
│
├── database/
│   ├── migrations/
│   │   ├── add_question_topic.sql
│   │   ├── blog_schema.sql
│   │   ├── groups_schema.sql
│   │   └── patch_groups_reset_at.sql
│   ├── schema.sql               # Initial database schema
│   ├── seed.sql                 # Demo data
│   ├── setup.js                 # Full DB setup (schema + seed)
│   ├── migrate.js               # Migration runner
│   ├── migrate_blog.js          # Blog migration script
│   ├── add_soft_delete.sql      # Soft delete migration
│   ├── debug_auth.js            # Debug utility (dev only)
│   ├── fix_passwords.js         # Password fix utility (dev only)
│   └── gen_hash.js              # Hash generator (dev only)
│
├── docs/                        # API documentation (if present)
├── .dockerignore                # Docker build exclusions
├── .env                         # Environment variables (DO NOT COMMIT)
├── .env.example                 # Environment template
├── .gitignore                   # Server-specific git ignores
├── Dockerfile                   # Multi-stage production image
└── package.json                 # Dependencies and scripts
```

### Server Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node src/index.js` | Start production server |
| `dev` | `nodemon src/index.js` | Start with auto-reload |
| `db:setup` | `node database/setup.js` | Create schema + insert seed data |
| `db:migrate` | `node database/migrate.js` | Run pending migrations |
| `db:migrate:blog` | `node database/migrate_blog.js` | Run blog-specific migration |

---

## Client (`client/`)

```
client/
├── src/
│   ├── app/
│   │   ├── App.tsx              # Root component (providers wrapping)
│   │   └── router.tsx           # Route definitions (createBrowserRouter)
│   │
│   ├── assets/                  # Static assets (images, SVGs)
│   │
│   ├── components/
│   │   ├── auth/                # Auth-related components (ProtectedRoute)
│   │   ├── common/              # Shared components (ErrorBoundary, etc.)
│   │   ├── goals/               # Goal-specific shared components
│   │   ├── layout/              # Layout shells (MainLayout, Sidebar, PublicLayout)
│   │   └── ui/                  # shadcn/ui primitives (button, dialog, table, etc.)
│   │
│   ├── config/
│   │   └── env.config.ts        # Environment configuration
│   │
│   ├── constants/
│   │   ├── index.ts             # Barrel export
│   │   ├── regex.ts             # Validation regex patterns
│   │   └── routes.ts            # Route path constants + helpers
│   │
│   ├── features/
│   │   ├── analytics/           # Charts, score trends
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── auth/                # Login, session management
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/           # Zustand auth store
│   │   │   └── index.ts
│   │   ├── blogs/               # Blog creation, editing, listing
│   │   ├── bookmarks/           # Bookmark management
│   │   ├── categories/          # Category browsing
│   │   ├── dashboard/           # Dashboard widgets
│   │   ├── goals/               # Goal tracking
│   │   ├── groups/              # Study groups
│   │   └── tests/               # Test-taking, creation, results
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── utils/
│   │       └── index.ts
│   │
│   ├── hooks/
│   │   └── usePermissions.ts    # Global permission hook
│   │
│   ├── lib/
│   │   ├── axios.ts             # Configured Axios instance + interceptors
│   │   ├── nprogress.tsx        # Page loading progress bar
│   │   ├── permissions.ts       # Permission checking logic
│   │   ├── queryClient.ts       # TanStack Query client config
│   │   ├── useNProgress.ts      # NProgress hook
│   │   └── utils.ts             # cn() utility for class merging
│   │
│   ├── pages/
│   │   ├── index.ts             # Barrel export for all pages
│   │   ├── AnalyticsPage.tsx
│   │   ├── BlogDetailPage.tsx
│   │   ├── BlogEditPage.tsx
│   │   ├── BlogListPage.tsx
│   │   ├── BlogManagePage.tsx
│   │   ├── BookmarksPage.tsx
│   │   ├── CategoryListPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ExamListPage.tsx
│   │   ├── GoalsPage.tsx
│   │   ├── GroupDetailPage.tsx
│   │   ├── GroupsPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SettingsPermissionsPage.tsx
│   │   ├── TestExamPage.tsx
│   │   ├── TestHistoryPage.tsx
│   │   ├── TestResultPage.tsx
│   │   └── TestTakingPage.tsx
│   │
│   ├── styles/
│   │   └── index.css            # Global styles + Tailwind directives
│   │
│   ├── types/
│   │   ├── index.ts             # Barrel export
│   │   ├── api.ts               # API response types
│   │   ├── blog.ts              # Blog-related types
│   │   ├── category.ts          # Category types
│   │   ├── goal.ts              # Goal types
│   │   ├── history.ts           # History/attempt types
│   │   ├── test.ts              # Test/question types
│   │   └── user.ts              # User/auth types
│   │
│   ├── utils/                   # General utilities
│   │
│   └── main.tsx                 # Application entry point (ReactDOM.createRoot)
│
├── public/                      # Static public assets
├── dist/                        # Build output (gitignored)
├── .editorconfig                # Editor formatting rules
├── .env                         # Environment variables
├── .env.development             # Development overrides
├── .gitignore                   # Client git ignores
├── .prettierrc                  # Prettier configuration
├── components.json              # shadcn/ui config
├── eslint.config.js             # ESLint flat config
├── index.html                   # HTML template (Vite entry)
├── package.json                 # Dependencies and scripts
├── postcss.config.js            # PostCSS (Tailwind plugin)
├── tsconfig.json                # TypeScript base config
├── tsconfig.app.json            # App-specific TS config
├── tsconfig.node.json           # Node (vite config) TS config
└── vite.config.ts               # Vite build configuration
```

### Client Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start development server with HMR |
| `build` | `tsc -b && vite build` | Type-check and build for production |
| `lint` | `eslint .` | Run ESLint on all files |
| `format` | `prettier --write .` | Format all files with Prettier |
| `preview` | `vite preview` | Preview production build locally |

---

## Documentation (`docs/`)

```
docs/
├── ARCHITECTURE.md          # System design and technical decisions
├── CODEBASE_OVERVIEW.md     # High-level code walkthrough
├── FOLDER_STRUCTURE.md      # This file
├── CODING_CONVENTIONS.md    # Style guide and patterns
├── CONTRIBUTING.md          # Contribution guidelines
├── ENVIRONMENT_SETUP.md     # Development environment setup
├── DEPLOYMENT_GUIDE.md      # Production deployment
├── API_REFERENCE.md         # REST API documentation
├── AUDIT_REPORT.md          # Codebase audit findings
└── REFACTOR_PLAN.md         # Proposed improvements
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Directories | kebab-case | `src/components/ui/` |
| React components | PascalCase | `LoginPage.tsx` |
| UI primitives (shadcn) | kebab-case | `alert-dialog.tsx` |
| Hooks | camelCase with `use` prefix | `usePermissions.ts` |
| Services/utils | camelCase | `axios.ts`, `response.js` |
| Controllers | dot-notation | `auth.controller.js` |
| Routes | dot-notation | `auth.routes.js` |
| Types | camelCase | `user.ts` |
| SQL files | snake_case | `groups_schema.sql` |
