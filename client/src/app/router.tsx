import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout, PublicLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import {
  LoginPage,
  CategoryListPage,
  TestTakingPage,
  TestResultPage,
  DashboardPage,
  TestExamPage,
  ExamListPage,
  ExamDetailPage,
  ProfilePage,
  TestHistoryPage,
  GoalsPage,
  BookmarksPage,
  GroupsPage,
  GroupDetailPage,
  SettingsPermissionsPage,
  BlogListPage,
  BlogDetailPage,
  BlogManagePage,
  BlogEditPage,
  AnalyticsPage,
} from '@/pages'

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Public blog routes (no auth required)
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/blog',
        element: <BlogListPage />,
      },
      {
        path: '/blog/:slug',
        element: <BlogDetailPage />,
      },
    ],
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
            path: '/analytics',
            element: <AnalyticsPage />,
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
            path: '/exams/:examId',
            element: <ExamDetailPage />,
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
          {
            path: '/groups',
            element: <GroupsPage />,
          },
          {
            path: '/groups/:id',
            element: <GroupDetailPage />,
          },
          // Blog management (protected)
          {
            path: '/blog/manage',
            element: <BlogManagePage />,
          },
          {
            path: '/blog/manage/new',
            element: <BlogEditPage mode="create" />,
          },
          {
            path: '/blog/manage/:id/edit',
            element: <BlogEditPage mode="edit" />,
          },
          {
            path: '/settings/permissions',
            element: <ProtectedRoute allowedRoles={['Admin']} />,
            children: [
              {
                index: true,
                element: <SettingsPermissionsPage />,
              },
            ],
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
