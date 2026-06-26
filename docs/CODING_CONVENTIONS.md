# Coding Conventions

Style guide, patterns, and conventions for the Review Certs codebase.

---

## General Principles

1. **Readability over cleverness** — Write code for humans first
2. **Consistency within a file** — Match the surrounding style
3. **Small functions** — Each function does one thing
4. **Explicit over implicit** — Name things clearly, avoid abbreviations
5. **No dead code** — Remove unused code, don't comment it out

---

## JavaScript / TypeScript Style

### Formatting (enforced by Prettier)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Variables | camelCase | `userId`, `testCount` |
| Functions | camelCase | `getTestById`, `calculateScore` |
| Constants (module-level) | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`, `DEFAULT_DURATION` |
| Classes | PascalCase | `ApiError`, `NotFoundError` |
| Type/Interface | PascalCase | `UserRole`, `TestAttempt` |
| Enum values | PascalCase | `Admin`, `Beginner` |
| React components | PascalCase | `TestCard`, `LoginPage` |
| Custom hooks | camelCase with `use` prefix | `usePermissions`, `useTest` |
| File names (components) | PascalCase | `TestCard.tsx` |
| File names (utilities) | camelCase | `queryClient.ts` |
| File names (UI/shadcn) | kebab-case | `alert-dialog.tsx` |
| CSS classes | Tailwind utility classes | `flex items-center gap-2` |

### Imports

Order imports consistently (enforced by ESLint):

```typescript
// 1. External libraries
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute imports (@/ alias)
import { useAuthStore } from '@/features/auth'
import { Button } from '@/components/ui'
import type { User } from '@/types'

// 3. Relative imports
import { TestCard } from './components/TestCard'
```

### TypeScript Specifics

```typescript
// Prefer interfaces for object shapes
interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

// Use type for unions, intersections, utilities
type UserRole = 'Admin' | 'Manager' | 'User'
type WithId<T> = T & { id: string }

// Prefer explicit return types on exported functions
export function calculateScore(answers: Record<string, string[]>): number { ... }

// Use `as const` for literal objects
export const ROUTES = { LOGIN: '/login', HOME: '/' } as const
```

---

## React Conventions

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui'

// 2. Types (if component-specific)
interface TestCardProps {
  title: string
  duration: number
  onStart: () => void
}

// 3. Component (named export preferred for feature components)
export function TestCard({ title, duration, onStart }: TestCardProps) {
  // a. Hooks first
  const [isHovered, setIsHovered] = useState(false)

  // b. Derived state / computations
  const formattedDuration = `${duration} min`

  // c. Handlers
  function handleClick() {
    onStart()
  }

  // d. Render
  return (
    <div className="rounded-lg border p-4">
      <h3>{title}</h3>
      <span>{formattedDuration}</span>
      <Button onClick={handleClick}>Start</Button>
    </div>
  )
}
```

### Hook Patterns

```typescript
// Custom query hook — one per API endpoint
export function useTests(categoryId: string) {
  return useQuery({
    queryKey: ['tests', { categoryId }],
    queryFn: () => testService.getByCategory(categoryId),
    enabled: !!categoryId,
  })
}

// Custom mutation hook
export function useSubmitTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: testService.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}
```

### State Management Rules

1. **Server data → TanStack Query** (never duplicate API data in Zustand)
2. **Auth/session → Zustand** (persisted to localStorage)
3. **Form state → react-hook-form** (not manual useState per field)
4. **UI state → local useState** (modals, tabs, toggles)

---

## Backend Conventions

### Controller Pattern

Controllers handle HTTP concerns only:

```javascript
/**
 * Create a new category
 * POST /api/categories
 */
export async function createCategory(req, res, next) {
  try {
    // Extract validated input
    const { name, description, icon } = req.body

    // Call service / perform logic
    // ... 

    // Return standardized response
    return successResponse(res, category, 'Category created successfully', 201)
  } catch (error) {
    next(error)
  }
}
```

### JSDoc Comments

All exported functions must have JSDoc:

```javascript
/**
 * Brief description of what the function does
 * HTTP_METHOD /api/route/path
 *
 * @param {object} req.body.fieldName - Description
 * @returns {object} Description of response data
 */
```

### Error Handling

```javascript
// Throw ApiError for expected errors
if (!category) {
  return errorResponse(res, 'Category not found', 404)
}

// Let unexpected errors bubble to global handler
// (don't catch and re-throw generic errors)
```

### SQL Conventions

```sql
-- Use parameterized queries ALWAYS (never string interpolation for values)
SELECT * FROM users WHERE id = ?

-- Use UPPER CASE for SQL keywords
SELECT id, name, email FROM users WHERE deleted_at IS NULL ORDER BY name ASC

-- Align long queries for readability
SELECT
  t.id, t.title, t.duration,
  COUNT(q.id) AS question_count
FROM tests t
LEFT JOIN questions q ON q.test_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id
ORDER BY t.created_at DESC
```

---

## API Response Format

### Success (single resource)

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "uuid",
    "name": "JavaScript",
    "testCount": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Success (paginated list)

```json
{
  "data": [{ ... }, { ... }],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

### Error

```json
{
  "success": false,
  "message": "Category not found",
  "statusCode": 404
}
```

### Field Naming in Responses

- Always use **camelCase** in JSON responses
- Transform database snake_case fields in the controller/mapper layer
- Dates are ISO 8601 strings: `"2024-01-15T10:30:00.000Z"`
- IDs are UUID strings: `"550e8400-e29b-41d4-a716-446655440000"`

---

## Git Conventions

### Branch Naming

```
feature/add-user-registration
fix/group-progress-calculation
refactor/extract-test-service
docs/update-api-reference
chore/upgrade-dependencies
```

### Commit Messages (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation only |
| `style` | Formatting (no logic change) |
| `test` | Adding or fixing tests |
| `chore` | Build, CI, deps, tooling |
| `perf` | Performance improvement |

**Examples:**

```
feat(groups): add leaderboard endpoint
fix(auth): handle expired token redirect loop
refactor(server): extract user repository
docs: add API reference documentation
chore(deps): upgrade react to 19.2
```

### Pull Request Size

- Keep PRs under 400 lines of meaningful change
- One concern per PR (don't mix refactoring with features)
- Include a description of what and why (not just what files changed)

---

## File Organization Rules

1. **One component per file** (React)
2. **Barrel exports** (`index.ts`) for feature modules — export only the public API
3. **Co-locate** related files (tests next to source, types next to usage)
4. **Feature isolation** — features should not import from other features directly; share via `components/` or `lib/`

---

## Error Handling

### Frontend

```typescript
// Use TanStack Query's error state
const { data, error, isLoading } = useTest(id)

if (error) {
  return <ErrorMessage message={getErrorMessage(error)} />
}

// For mutations, use onError callback
const mutation = useSubmitTest()
mutation.mutate(data, {
  onError: (error) => toast.error(getErrorMessage(error)),
  onSuccess: () => navigate('/result'),
})
```

### Backend

```javascript
// Expected errors: return error response directly
if (!user) return errorResponse(res, 'User not found', 404)

// Unexpected errors: let them propagate to errorHandler middleware
// The global handler logs and returns a sanitized 500 response
```

---

## Security Rules

1. **Never log sensitive data** (passwords, tokens, PII)
2. **Always use parameterized queries** (never template literals for SQL values)
3. **Validate all input** before processing
4. **Check authorization** on every protected endpoint
5. **Don't expose stack traces** in production responses
6. **Store secrets in environment variables** (never in code)
