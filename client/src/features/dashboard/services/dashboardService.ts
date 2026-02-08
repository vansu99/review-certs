import axiosInstance from '@/lib/axios'
import type { ApiResponse } from '@/types'

export interface DashboardStats {
  testsCompleted: number
  averageScore: number
  totalTime: string
  streak: number
}

export interface RecentActivity {
  id: string
  test: string
  score: number
  date: string
}

export const dashboardService = {
  /**
   * Get dashboard stats
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    return response.data.data
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit: number = 5): Promise<RecentActivity[]> => {
    const response = await axiosInstance.get<ApiResponse<RecentActivity[]>>(
      `/dashboard/recent-activity?limit=${limit}`
    )
    return response.data.data
  },
}
