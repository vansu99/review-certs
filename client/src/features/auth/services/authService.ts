import axiosInstance from '@/lib/axios'
import type { AuthResponse, LoginCredentials, User, ApiResponse } from '@/types'

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    return response.data.data
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout')
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>('/auth/profile')
    return response.data.data
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: {
    firstName: string
    lastName: string
    phone?: string
    gender?: 'male' | 'female'
    dateOfBirth?: string
    country?: string
    facebook?: string
  }): Promise<User> => {
    const response = await axiosInstance.put<ApiResponse<User>>('/auth/profile', data)
    return response.data.data
  },
}

// Export axiosInstance for use in other services
export { axiosInstance }
