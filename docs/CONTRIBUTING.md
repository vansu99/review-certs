# Contributing

Guidelines for contributing to Review Certs. Whether you're fixing a bug, adding a feature, or improving documentation — welcome aboard.

---

## Getting Started

1. **Read the docs first**
   - [Codebase Overview](./CODEBASE_OVERVIEW.md) — understand the project structure
   - [Coding Conventions](./CODING_CONVENTIONS.md) — follow the style guide
   - [Environment Setup](./ENVIRONMENT_SETUP.md) — get your dev environment running

2. **Pick an issue** or create one describing what you want to work on

3. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** following the conventions below

5. **Submit a Pull Request**

---

## Development Workflow

### 1. Set Up Local Environment

```bash
# Clone and install
git clone <repository-url>
cd review-certs

# Backend
cd server
cp .env.example .env
# Edit .env with your local MySQL credentials
npm install
npm run db:setup
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

### 2. Create a Feature Branch

```bash
# Branch naming convention
git checkout -b <type>/<description>

# Examples:
git checkout -b feature/add-password-reset
git checkout -b fix/group-progress-calc
git checkout -b refactor/extract-test-service
```

### 3. Make Changes

- Write clean, readable code following [Coding Conventions](./CODING_CONVENTIONS.md)
- Keep commits small and focused
- Use [Conventional Commits](#commit-messages)
- Add/update types when modifying API contracts

### 4. Test Your Changes

```bash
# Frontend
cd client
npm run lint          # Check for linting errors
npm run build         # Ensure production build passes

# Backend
cd server
# Run your changes manually and verify with curl/Postman
```

### 5. Submit a Pull Request

- Fill out the PR template completely
- Link related issues
- Add screenshots for UI changes
- Request review from maintainers

---

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

<optional longer description>

<optional footer (e.g., "Fixes #123")>
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | Adding new functionality |
| `fix` | Fixing a bug |
| `refactor` | Restructuring without changing behavior |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace (no logic) |
| `test` | Adding or updating tests |
| `chore` | Tooling, deps, build config |
| `perf` | Performance improvement |

### Examples

```bash
git commit -m "feat(auth): add password reset endpoint"
git commit -m "fix(groups): correct progress calculation for empty groups"
git commit -m "refactor(server): extract notification service"
git commit -m "docs: add API reference for blog endpoints"
```

---

## Pull Request Guidelines

### PR Title

Follow the same Conventional Commits format:
```
feat(groups): add member removal endpoint
```

### PR Description Template

```markdown
## What

Brief description of what this PR does.

## Why

Context on why this change is needed.

## How

Technical approach taken.

## Testing

How you verified the changes work:
- [ ] Manual testing steps
- [ ] API tested with curl/Postman
- [ ] Frontend tested in browser
- [ ] Edge cases considered

## Screenshots (if UI changes)

Before | After
```

### PR Size

- Aim for **under 400 lines** of meaningful change
- If a feature is larger, break it into incremental PRs
- Refactoring PRs should not include feature changes (and vice versa)

### Review Checklist

Reviewers will check:

- [ ] Code follows project conventions
- [ ] No hardcoded values (use constants/config)
- [ ] SQL uses parameterized queries
- [ ] Error cases are handled
- [ ] API responses follow the standard format
- [ ] No console.log left in (use proper logging)
- [ ] Types are updated if API contracts changed

---

## Code Review Etiquette

### As an Author

- Keep PRs focused — one concern per PR
- Respond to all review comments
- Don't take feedback personally — it's about the code
- If you disagree, explain your reasoning

### As a Reviewer

- Be constructive — suggest alternatives, not just "this is wrong"
- Distinguish between blockers (must fix) and nits (nice to have)
- Approve once blocking issues are resolved
- Review within 24 hours when possible

---

## Reporting Bugs

Create an issue with:

1. **Title:** Short, descriptive summary
2. **Environment:** Browser, OS, Node version
3. **Steps to reproduce:** Numbered steps to trigger the bug
4. **Expected behavior:** What should happen
5. **Actual behavior:** What actually happens
6. **Screenshots/logs:** If applicable

---

## Requesting Features

Create an issue with:

1. **Title:** Brief feature description
2. **Problem:** What problem does this solve?
3. **Proposed solution:** How you'd like it to work
4. **Alternatives considered:** Other approaches you thought of
5. **Priority:** How important is this?

---

## Project Structure Rules

When adding new code:

### Backend

- **New endpoint?** → Create route in `routes/`, handler in `controllers/`
- **New domain?** → Create all three: route, controller, and (eventually) service
- **Shared logic?** → Put in `utils/` (pure functions) or `middleware/` (request-level)
- **New table?** → Create a migration file in `database/migrations/`

### Frontend

- **New page?** → Create in `pages/`, add route in `app/router.tsx`, export from `pages/index.ts`
- **New feature?** → Create directory in `features/` with hooks, services, components subdirs
- **Shared component?** → Put in `components/common/` or `components/ui/`
- **New API call?** → Add to the relevant `features/{name}/services/` file
- **New type?** → Add to `types/{domain}.ts`

---

## Dependencies

### Adding New Dependencies

- Prefer well-known, actively maintained packages
- Check bundle size impact (use [bundlephobia.com](https://bundlephobia.com))
- Use exact versions in `package.json`
- Justify the addition in your PR description

### Avoid

- Packages that duplicate existing functionality
- Packages with no recent maintenance (>1 year since last publish)
- Packages with known vulnerabilities
- Giant utility libraries when you need one function

---

## Questions?

If something is unclear or you need help:

1. Check existing documentation
2. Search closed issues for similar questions
3. Create a discussion or issue with your question
4. Reach out to maintainers

We value every contribution. Thank you for helping improve Review Certs.
