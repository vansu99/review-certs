import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import {
  LoginPage,
  CategoryListPage,
  TestTakingPage,
  TestResultPage,
  DashboardPage,
  TestExamPage,
  ExamListPage,
  ProfilePage,
  TestHistoryPage,
  GoalsPage,
  BookmarksPage,
} from '@/pages'

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Protected routes with MainLayout
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/categories" replace />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/categories',
            element: <CategoryListPage />,
          },
          {
            path: '/categories/:categoryId',
            element: <ExamListPage />,
          },
          {
            path: '/tests/:id',
            element: <TestTakingPage />,
          },
          {
            path: '/tests/:id/result',
            element: <TestResultPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/history',
            element: <TestHistoryPage />,
          },
          {
            path: '/goals',
            element: <GoalsPage />,
          },
          {
            path: '/bookmarks',
            element: <BookmarksPage />,
          },
        ],
      },
    ],
  },

  // Test Exam Page - Fullscreen mode without MainLayout (protected)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/test/:id/exam',
        element: <TestExamPage />,
      },
    ],
  },

  // Catch all - redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
