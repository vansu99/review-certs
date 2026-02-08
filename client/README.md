# ReviewCerts - Knowledge Review Platform

A modern frontend application for reviewing and testing your knowledge across various topics.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Demo Credentials

- **Email:** user@example.com
- **Password:** password

## 📁 Project Structure

```
src/
├── app/                          # App configuration
│   ├── App.tsx                   # Root component with providers
│   ├── main.tsx                  # Entry point
│   └── router.tsx                # React Router configuration
│
├── components/                   # Shared/reusable components
│   ├── auth/                     # Auth-related components
│   │   └── ProtectedRoute.tsx    # Route guard for authenticated routes
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx            # Top navigation
│   │   ├── Sidebar.tsx           # Side navigation
│   │   └── MainLayout.tsx        # Main layout wrapper
│   └── ui/                       # Basic UI components
│       ├── Button.tsx            # Button component
│       └── Input.tsx             # Input component
│
├── features/                     # Feature-based modules
│   ├── auth/                     # Authentication feature
│   │   ├── hooks/                # Auth hooks (useLogin, useLogout)
│   │   ├── services/             # Auth API services
│   │   └── store/                # Zustand auth store
│   ├── categories/               # Categories feature
│   │   ├── components/           # Category UI components
│   │   ├── hooks/                # Category data hooks
│   │   └── services/             # Category API services
│   ├── tests/                    # Tests feature
│   │   ├── components/           # Test UI components
│   │   ├── hooks/                # Test data hooks
│   │   └── services/             # Test API services
│   └── dashboard/                # Dashboard feature
│
├── pages/                        # Route page components
│   ├── LoginPage.tsx
│   ├── CategoryListPage.tsx
│   ├── TestTakingPage.tsx
│   ├── TestResultPage.tsx
│   └── DashboardPage.tsx
│
├── lib/                          # Core libraries & configs
│   ├── axios.ts                  # Axios instance + interceptors
│   └── queryClient.ts            # TanStack Query client
│
├── types/                        # Global TypeScript types
│   ├── user.ts                   # User, AuthResponse, LoginCredentials
│   ├── category.ts               # Category
│   ├── test.ts                   # Test, Question, AnswerOption, TestAttempt
│   └── api.ts                    # ApiResponse, PaginatedResponse, ApiError
│
└── styles/                       # Global styles
    └── index.css                 # TailwindCSS imports + CSS variables
```

## 🏗️ Architecture

### Feature-Based Structure

Each feature module contains its own:

- **components/** - UI components specific to the feature
- **hooks/** - React hooks for data fetching and business logic
- **services/** - API service functions
- **store/** - Zustand stores (if needed)

### State Management

- **Zustand** - Client state (auth, UI state)
- **TanStack Query** - Server state (API data caching)

### API Layer

- **Axios** - HTTP client with interceptors for auth token
- Services return typed data, hooks wrap services with TanStack Query

## 📝 Code Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `CategoryCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useCategories.ts`)
- Services: `camelCase.ts` with `Service` suffix (e.g., `categoryService.ts`)
- Types: `camelCase.ts` (e.g., `category.ts`)

### Imports

Use path aliases for cleaner imports:

```typescript
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/features/auth'
import type { User } from '@/types'
```

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react'

// 2. Types/Interfaces
interface Props {
  title: string
}

// 3. Component
export const MyComponent = ({ title }: Props) => {
  // hooks first
  const [state, setState] = useState('')

  // handlers
  const handleClick = () => {}

  // render
  return <div>{title}</div>
}
```

### Barrel Exports

Each folder has an `index.ts` for clean exports:

```typescript
// features/auth/index.ts
export { useAuthStore } from './store'
export { useLogin, useLogout } from './hooks'
export { authService } from './services'
```

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

### API Configuration

Update `src/lib/axios.ts` to change:

- Base URL
- Timeout
- Interceptors

## 📦 Tech Stack

| Category       | Technology            |
| -------------- | --------------------- |
| Framework      | React 19              |
| Language       | TypeScript (strict)   |
| Build Tool     | Vite                  |
| Styling        | TailwindCSS           |
| State (Client) | Zustand               |
| State (Server) | TanStack Query        |
| HTTP Client    | Axios                 |
| Forms          | React Hook Form + Zod |
| Routing        | React Router DOM      |
| Linting        | ESLint + Prettier     |

## 🔜 Next Steps

1. Connect to real backend API
2. Add more test categories and questions
3. Implement user progress tracking
4. Add dark mode support
5. Write unit and integration tests
