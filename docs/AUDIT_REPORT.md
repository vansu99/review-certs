# Codebase Audit Report — Review Certs

**Date:** June 21, 2026  
**Auditor Role:** Principal Software Architect / Code Quality Specialist  
**Project:** Review Certs — Full-Stack Quiz/MCQ Certification System  
**Stack:** React 19 + Vite + TypeScript (client) | Express.js + MySQL (server)

---

## Executive Summary

Review Certs is a functional, feature-rich quiz platform with a decent frontend architecture (feature-based modules, typed state management, proper routing). However, the **backend suffers from significant architectural debt**: no service layer, no input validation framework, raw SQL in controllers, duplicated query patterns, hardcoded values, and missing security hardening. The frontend is better organized but has inconsistencies in how features are structured.

**Overall Health Score: 5.5/10**

| Area | Score | Notes |
|------|-------|-------|
| Frontend Architecture | 7/10 | Feature-based, typed, uses good libraries |
| Backend Architecture | 4/10 | Fat controllers, no separation of concerns |
| Security | 4/10 | CORS wide open, no rate limiting, no input sanitization |
| Database | 6/10 | Good schema design, but no migration tool, ad-hoc scripts |
| DevOps | 6/10 | Docker works, but no CI/CD, no test infrastructure |
| Documentation | 3/10 | Minimal README, no API docs, no contributing guide |
| Code Quality | 5/10 | Linting on client only, no server linting, inconsistencies |

---

## 1. Hardcoded Values

| # | Description | File(s) | Priority | Remediation |
|---|-------------|---------|----------|-------------|
| H1 | JWT secret fallback `"your-super-secret-jwt-key-change-in-production"` | `docker-compose.yml` | **CRITICAL** | Remove default fallback; fail fast if `JWT_SECRET` not set |
| H2 | Database password fallback `"admin@123"` | `docker-compose.yml` | **CRITICAL** | Remove hardcoded defaults for production |
| H3 | `startedAt` hardcoded to 15 minutes ago: `Date.now() - 1000 * 60 * 15` | `test.controller.js:submitTest()` | **HIGH** | Accept `startedAt` from the client request body or track it server-side via session/DB |
| H4 | Default duration `30`, difficulty `"Beginner"`, passing score `70` scattered in controller | `test.controller.js:createTest()` | **MEDIUM** | Move to a constants file or database-level defaults |
| H5 | Default icon `"📚"` for categories | `category.controller.js` | **LOW** | Move to a `DEFAULTS` config object |
| H6 | Pagination defaults (pageSize: 10, max: 50) repeated in blog controller | `blog.controller.js` | **MEDIUM** | Create a shared pagination utility with configurable defaults |
| H7 | Period whitelist `PERIOD_MAP` defined at controller-level | `analytics.controller.js` | **LOW** | Move to constants/config |
| H8 | CORS allowed with `app.use(cors())` — allows ALL origins | `server/src/index.js` | **HIGH** | Configure allowed origins from env |

---

## 2. Magic Numbers

| # | Description | File(s) | Priority |
|---|-------------|---------|----------|
| M1 | `1000 * 60 * 15` (15 minutes) for fake start time | `test.controller.js` | HIGH |
| M2 | `86400000` (milliseconds in a day) | `dashboard.controller.js` | LOW |
| M3 | `365` days for heatmap | `dashboard.controller.js` | LOW |
| M4 | `10000` timeout in axios config | `client/src/lib/axios.ts` | LOW |
| M5 | `30` progress threshold in `removeExam` | `group.controller.js` | MEDIUM |
| M6 | Slug truncation `substring(0, 200)` | `blog.controller.js` | LOW |

**Remediation:** Extract all magic numbers to named constants. Example:
```javascript
// server/src/constants/index.js
export const PAGINATION = { DEFAULT_PAGE_SIZE: 10, MAX_PAGE_SIZE: 50 }
export const DEFAULTS = { TEST_DURATION: 30, PASSING_SCORE: 70 }
export const GROUP_RULES = { MIN_PROGRESS_TO_LOCK_EXAMS: 30 }
```

---

## 3. Naming Inconsistencies

| # | Issue | Examples | Priority |
|---|-------|----------|----------|
| N1 | Mixed import styles for Router | `auth.routes.js` uses `import { Router }`, `group.routes.js` uses `import express` then `express.Router()` | LOW |
| N2 | Inconsistent file casing in client | `Input.tsx` (PascalCase) vs `field.tsx` (camelCase) in `components/ui/` | MEDIUM |
| N3 | `test` naming collision — domain concept "test" clashes with testing terminology | Throughout codebase | LOW (cosmetic) |
| N4 | camelCase vs snake_case in API responses | Server sends `passing_score` in some places, `passingScore` in mapped responses | HIGH |
| N5 | Controller exports: some use `export async function`, all consistent (good), but no `default export` consistency with routes | Routes/Controllers | LOW |
| N6 | Env var naming — `VITE_API_BASE_URL` vs `VITE_APP_BASE_URL` — `APP` is empty/unused | `client/.env` | LOW |

---

## 4. Duplicated Logic

| # | Description | Files | Priority | Remediation |
|---|-------------|-------|----------|-------------|
| D1 | User data mapping (snake_case → camelCase) repeated 4 times | `auth.controller.js` (login, getProfile, updateProfile) | **HIGH** | Create a `mapUserRow(row)` transformer |
| D2 | "Check if exists then 404" pattern repeated in every update/delete | All controllers | **HIGH** | Create a `findOrFail(table, id)` utility |
| D3 | Admin role check in group controller duplicated 5+ times | `group.controller.js` | **HIGH** | Create `requireGroupAdmin(groupId, userId)` middleware |
| D4 | Option fetching + correct answer map building duplicated in `test.controller.js` and `history.controller.js` | 2 controllers, 3 functions | **HIGH** | Extract to `getQuestionsWithOptions(testId)` service |
| D5 | Notification creation pattern (uuid + insert) repeated 3 times | `group.controller.js` | **MEDIUM** | Create `createNotification(userId, type, message, data)` utility |
| D6 | Blog response mapping duplicated 4 times | `blog.controller.js` | **MEDIUM** | Create `mapBlogRow(row)` transformer |
| D7 | Group progress calculation (loop over members, check passes) duplicated in `getGroupById` and `removeExam` | `group.controller.js` | **HIGH** | Extract to `calculateGroupProgress(groupId)` |

---

## 5. Architectural Issues

### 5.1 No Service Layer (Backend)

**Priority: CRITICAL**

Controllers directly query the database, contain business logic, and handle HTTP responses. This violates Single Responsibility Principle.

```
Current: Route → Controller (SQL + Logic + Response)
Should be: Route → Controller (HTTP) → Service (Logic) → Repository (SQL)
```

**Impact:** Untestable business logic, massive controllers (group.controller.js is 350+ lines), impossible to reuse logic.

### 5.2 No Input Validation Framework (Backend)

**Priority: HIGH**

All validation is manual `if (!field)` checks. No schema validation, no type coercion, no sanitization.

**Risk:** SQL injection via unvalidated sort parameters (e.g., `sortOrder` in history.controller.js is interpolated into SQL), XSS via unescaped user content.

### 5.3 SQL Injection Vulnerability

**Priority: CRITICAL**

```javascript
// history.controller.js — sortOrder is user input interpolated directly
query += ` ORDER BY ta.score ${sortOrder === "asc" ? "ASC" : "DESC"}`;
// SAFE (ternary whitelist) ✓

// BUT: LIMIT/OFFSET use parseInt then template literal
query += ` LIMIT ${limitVal} OFFSET ${offset}`;
// SAFE (parseInt coercion) ✓ — but fragile pattern

// analytics.controller.js
`AND ta.completed_at >= DATE_SUB(NOW(), INTERVAL ${interval})`
// SAFE because interval comes from PERIOD_MAP whitelist ✓
```

While current code happens to be safe through implicit validation, the **pattern is dangerous**. A future developer could easily introduce injection by following the same style without the whitelist.

### 5.4 No Request Logging / Monitoring

**Priority: MEDIUM**

No morgan, winston, pino, or any logging middleware. Console.log only.

### 5.5 Missing Graceful Shutdown

**Priority: MEDIUM**

Server has no `SIGTERM`/`SIGINT` handler to close DB pool and drain connections.

### 5.6 No Test Infrastructure

**Priority: HIGH**

Zero test files. No testing framework configured (no Jest, Vitest, Mocha). No CI pipeline.

---

## 6. Security Issues

| # | Issue | Severity | File(s) | Remediation |
|---|-------|----------|---------|-------------|
| S1 | CORS allows all origins | **HIGH** | `server/src/index.js` | Restrict to known frontend URLs |
| S2 | No rate limiting | **HIGH** | Server-wide | Add `express-rate-limit` |
| S3 | No helmet (security headers) | **MEDIUM** | `server/src/index.js` | Add `helmet()` middleware |
| S4 | JWT secret has hardcoded fallback | **CRITICAL** | `docker-compose.yml` | Fail if not provided |
| S5 | No password complexity requirements | **MEDIUM** | No registration endpoint visible | Add validation when implementing registration |
| S6 | `.env` file committed to client | **HIGH** | `client/.env` | Add to `.gitignore`, use `.env.example` only |
| S7 | No CSRF protection | **LOW** | API uses JWT Bearer tokens (inherently CSRF-resistant) | Acceptable for SPA |
| S8 | `addMember` SQL: `WHERE email = ? OR name = ?` — OR without parentheses can match unintended rows | **MEDIUM** | `group.controller.js` | Fix: `WHERE (email = ? OR name = ?) AND deleted_at IS NULL` — note the AND binds tighter than OR currently |
| S9 | Blog fingerprinting uses IP+UA — easily spoofable | **LOW** | `blog.controller.js` | Acceptable for like anti-spam, not for security |

---

## 7. Performance Issues

| # | Issue | Severity | File(s) | Remediation |
|---|-------|----------|---------|-------------|
| P1 | N+1 query in `getGroupById` — loops over members, each making a DB call | **HIGH** | `group.controller.js` | Rewrite as a single aggregated query |
| P2 | N+1 query in `removeExam` — same pattern | **HIGH** | `group.controller.js` | Same fix |
| P3 | `getTestHistory` fetches ALL items to calculate stats, then paginates | **MEDIUM** | `history.controller.js` | Use `COUNT(*)` for total, separate stats query |
| P4 | `addExams` loop creates notifications one-by-one in a loop | **MEDIUM** | `group.controller.js` | Batch INSERT |
| P5 | `submitTest` saves answers one-by-one in a loop (no batch) | **MEDIUM** | `test.controller.js` | Use batch INSERT |
| P6 | No database connection pool size tuning for production | **LOW** | `config/database.js` | Make `connectionLimit` configurable via env |
| P7 | No query result caching (categories rarely change) | **LOW** | Server-wide | Consider Redis or in-memory cache for hot data |

---

## 8. Code Smells

| # | Smell | File(s) | Priority |
|---|-------|---------|----------|
| CS1 | **God Controller** — `group.controller.js` is 350+ lines with 10 functions | `group.controller.js` | HIGH |
| CS2 | **God Controller** — `blog.controller.js` is 400+ lines | `blog.controller.js` | HIGH |
| CS3 | **Dead code** — `addExams` declares `addedCount`/`skippedCount` as `const` then tries to increment (bug!) | `group.controller.js` | HIGH (BUG) |
| CS4 | **Unused variable** — `const addedCount = 0` never actually incremented (const) | `group.controller.js` | HIGH (BUG) |
| CS5 | **Mixed concerns** — `generateToken` lives in `middleware/auth.js` not in a service | `middleware/auth.js` | MEDIUM |
| CS6 | **Empty file** — `client/src/config/env.config.ts` | Client config | LOW |
| CS7 | **Debug files in database dir** — `debug_auth.js`, `fix_passwords.js`, `gen_hash.js` | `server/database/` | MEDIUM |
| CS8 | Duplicate route mount: `/api/history` and `/api/attempts` both map to `historyRoutes` | `server/src/index.js` | LOW |
| CS9 | `dotenv.config()` called AFTER importing modules that use `process.env` | `server/src/index.js` | MEDIUM |

---

## 9. Missing Infrastructure

| # | Missing Item | Priority | Impact |
|---|-------------|----------|--------|
| I1 | No test framework (unit/integration/e2e) | **CRITICAL** | Can't verify correctness |
| I2 | No CI/CD pipeline (GitHub Actions, etc.) | **HIGH** | No automated quality gates |
| I3 | No database migration tool (knex, prisma migrate, etc.) | **HIGH** | Ad-hoc SQL files are error-prone |
| I4 | No API documentation (Swagger/OpenAPI) | **MEDIUM** | Hard for frontend devs to integrate |
| I5 | No error monitoring (Sentry, etc.) | **MEDIUM** | Blind to production errors |
| I6 | No server-side linting/formatting | **MEDIUM** | Inconsistent server code style |
| I7 | No pre-commit hooks (husky + lint-staged) | **LOW** | Bad code can be committed |
| I8 | No health monitoring beyond basic `/api/health` | **LOW** | No DB health, memory, etc. |

---

## 10. Folder Structure Issues

### Backend

```
server/src/
├── config/          # Only 1 file — fine
├── controllers/     # 10 fat controllers doing everything
├── middleware/      # 3 files — appropriate
├── routes/          # 10 route files — fine
├── utils/           # Only 1 file — underutilized
└── index.js         # Entry point
```

**Problems:**
- No `services/` layer — business logic lives in controllers
- No `validators/` or `schemas/` — no input validation
- No `models/` or `repositories/` — SQL scattered in controllers
- No `constants/` — magic values everywhere
- `database/` dir at server root has debug scripts mixed with production schemas

### Frontend

```
client/src/
├── app/             # App + Router — good
├── assets/          # Static assets
├── components/      # Shared components (auth, common, layout, ui)
├── config/          # Empty file
├── constants/       # Routes, regex
├── features/        # Feature modules (9 features) — good pattern
├── hooks/           # Global hooks (1 file)
├── lib/             # Utilities (axios, permissions, etc.)
├── pages/           # Page components (20 files)
├── styles/          # CSS
├── types/           # Type definitions
└── utils/           # Utilities
```

**Problems:**
- `config/env.config.ts` is empty — unused scaffolding
- `lib/` vs `utils/` distinction is unclear — both contain utilities
- `hooks/` at root has only 1 file — could merge into `lib/`
- Some features have `hooks/` subdirs, some don't — inconsistent

---

## 11. Bug Report

| # | Bug | File | Severity |
|---|-----|------|----------|
| B1 | `const addedCount = 0` then `addedCount++` — TypeError in strict mode (incrementing const) | `group.controller.js:addExams()` | **HIGH** |
| B2 | SQL operator precedence: `WHERE email = ? OR name = ? AND deleted_at IS NULL` — AND binds tighter, so this matches ANY email regardless of deleted_at | `group.controller.js:addMember()` | **MEDIUM** |
| B3 | `dotenv.config()` is called after imports — modules imported before dotenv runs won't have env vars (mitigated because `database.js` calls its own `dotenv.config()`) | `server/src/index.js` | **LOW** |

---

## Priority Matrix

```
CRITICAL (fix immediately):
├── No service layer (architecture debt)
├── No input validation framework
├── JWT secret hardcoded fallback
├── No test infrastructure
└── Bug B1 (const increment)

HIGH (fix this sprint):
├── CORS wide open
├── No rate limiting
├── N+1 queries in group controller
├── .env committed to repo
├── Duplicated logic (6+ instances)
└── No CI/CD pipeline

MEDIUM (plan for next sprint):
├── No helmet security headers
├── No request logging
├── No graceful shutdown
├── Pagination utility needed
├── Naming inconsistencies
└── Debug files in database/

LOW (backlog):
├── Magic numbers extraction
├── File casing inconsistencies
├── Default icon config
└── Pre-commit hooks
```

---

## Conclusion

The project is **functional but not production-ready**. The frontend is reasonably well-architected with feature modules, typed state, and proper library choices. The backend needs significant refactoring to introduce proper layering, validation, and security hardening. The most impactful improvements would be:

1. Introduce a service layer on the backend
2. Add input validation (Joi or Zod)
3. Fix the critical bugs (B1, B2)
4. Add security middleware (helmet, rate-limit, CORS config)
5. Set up a test framework and CI pipeline
