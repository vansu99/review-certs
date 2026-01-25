/**
 * Application route constants
 */

// Auth routes
export const ROUTES = {
  LOGIN: '/login',

  // Main routes
  HOME: '/',
  DASHBOARD: '/dashboard',
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: '/categories/:categoryId',

  // Test routes
  TEST: '/tests/:id',
  TEST_RESULT: '/tests/:id/result',
} as const

/**
 * Helper function to generate dynamic routes
 */
export const generateRoute = {
  categoryDetail: (categoryId: string | number) => `/categories/${categoryId}`,

  test: (id: string | number) => `/tests/${id}`,

  testResult: (id: string | number) => `/tests/${id}/result`,
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]
