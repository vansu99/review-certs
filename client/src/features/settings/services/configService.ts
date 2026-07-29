import axiosInstance from '@/lib/axios'
import type { ApiResponse } from '@/types'

export interface AuthConfig {
  id: string
  auth_method: string
  enabled: boolean
  config: Record<string, unknown>
  priority: number
  created_at: string
  updated_at: string
}

export interface AuthConfigListResponse {
  configs: AuthConfig[]
}

export const configService = {
  /**
   * Get all auth configurations
   */
  getAuthConfigs: async (): Promise<AuthConfig[]> => {
    const response =
      await axiosInstance.get<ApiResponse<AuthConfigListResponse>>('/admin/config/auth')
    return response.data.data.configs
  },

  /**
   * Toggle an auth method on/off
   */
  toggleAuthMethod: async (method: string): Promise<{ auth_method: string; enabled: boolean }> => {
    const response = await axiosInstance.put<
      ApiResponse<{ auth_method: string; enabled: boolean }>
    >(`/admin/config/auth/${method}/toggle`)
    return response.data.data
  },

  /**
   * Update an auth method's config
   */
  updateAuthConfig: async (
    method: string,
    data: { enabled?: boolean; config?: Record<string, unknown> }
  ): Promise<AuthConfig> => {
    const response = await axiosInstance.put<ApiResponse<AuthConfig>>(
      `/admin/config/auth/${method}`,
      data
    )
    return response.data.data
  },
}
