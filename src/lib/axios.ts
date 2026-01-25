import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Custom error types for better error handling
export interface ApiErrorResponse {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  statusCode: number
  errors?: Record<string, string[]>

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle error status codes
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const statusCode = error.response?.status
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'

    switch (statusCode) {
      case 401:
        // Token expired or invalid - clear auth and redirect to login
        handleUnauthorized()
        break

      case 403:
        // Forbidden - user doesn't have permission
        handleForbidden(errorMessage)
        break

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        handleServerError(statusCode, errorMessage)
        break

      default:
        // Other errors (400, 404, etc.)
        break
    }

    // Return a custom ApiError for better error handling in components
    return Promise.reject(new ApiError(errorMessage, statusCode || 0, error.response?.data?.errors))
  }
)

/**
 * Handle 401 Unauthorized - Token expired or invalid
 */
function handleUnauthorized(): void {
  // Clear all auth data
  localStorage.removeItem('accessToken')
  localStorage.removeItem('auth-storage') // Clear Zustand persisted state

  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    // Store the current path to redirect back after login
    const currentPath = window.location.pathname + window.location.search
    if (currentPath !== '/' && currentPath !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', currentPath)
    }

    window.location.href = '/login'
  }
}

/**
 * Handle 403 Forbidden - User doesn't have permission
 */
function handleForbidden(message: string): void {
  // Log for debugging
  console.error('[API] Forbidden:', message)

  // You can show a toast notification here
  // toast.error('You do not have permission to perform this action')

  // Optionally redirect to a "no permission" page
  // window.location.href = '/forbidden'
}

/**
 * Handle 5xx Server Errors
 */
function handleServerError(statusCode: number, message: string): void {
  // Log for debugging/monitoring
  console.error(`[API] Server Error ${statusCode}:`, message)

  // You can show a toast notification here
  // toast.error('Server error. Please try again later.')

  // Optionally report to error monitoring service (Sentry, etc.)
  // reportError({ statusCode, message })
}

/**
 * Helper to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Helper to get error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export default axiosInstance
