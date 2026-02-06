import axiosInstance from '@/lib/axios'
import type { AuthResponse, LoginCredentials, User } from '@/types'

// Mock delay for simulating API calls
const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock user data
const mockUsers: Record<string, User> = {
  'admin@example.com': {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'Admin',
  },
  'manager@example.com': {
    id: '2',
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'Manager',
  },
  'user@example.com': {
    id: '3',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'User',
  },
}

export const authService = {
  /**
   * Login with email and password
   * Currently using mock data - replace with real API call
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Mock implementation - replace with real API call
    await mockDelay(500)

    // Simulate validation
    const user = mockUsers[credentials.email]
    if (user && credentials.password === 'password') {
      return {
        user,
        accessToken: 'mock-jwt-token-' + Date.now(),
      }
    }

    throw new Error('Invalid email or password')
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    // Mock implementation
    await mockDelay(200)

    // Real API call would be:
    // await axiosInstance.post('/auth/logout')
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    // Mock implementation
    await mockDelay(300)
    return mockUsers['user@example.com']

    // Real API call would be:
    // const response = await axiosInstance.get<User>('/auth/profile')
    // return response.data
  },
}

// Export axiosInstance for use in other services
export { axiosInstance }
