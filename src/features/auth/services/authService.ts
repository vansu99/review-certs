import axiosInstance from '@/lib/axios'
import type { AuthResponse, LoginCredentials, User } from '@/types'

// Mock delay for simulating API calls
const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  name: 'Test User',
  avatar: undefined,
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
    if (credentials.email === 'user@example.com' && credentials.password === 'password') {
      return {
        user: mockUser,
        accessToken: 'mock-jwt-token-' + Date.now(),
      }
    }

    throw new Error('Invalid email or password')

    // Real API call would be:
    // const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials)
    // return response.data
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
    return mockUser

    // Real API call would be:
    // const response = await axiosInstance.get<User>('/auth/profile')
    // return response.data
  },
}

// Export axiosInstance for use in other services
export { axiosInstance }
