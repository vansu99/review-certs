import axiosInstance from '@/lib/axios'
import type { Goal, GoalFilters, GoalsResponse, CreateGoalPayload, AwardTier } from '@/types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// Helper to calculate award tier based on average score
const calculateAwardTier = (avgScore: number): AwardTier => {
  if (avgScore >= 100) return 'perfect'
  if (avgScore >= 95) return 'diamond'
  if (avgScore >= 90) return 'gold'
  if (avgScore >= 80) return 'silver'
  return 'bronze'
}

export const goalService = {
  /**
   * Get all goals with optional filters
   */
  getGoals: async (filters: GoalFilters = {}): Promise<GoalsResponse> => {
    const params = new URLSearchParams()

    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status)
    }
    if (filters.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority)
    }

    const url = params.toString() ? `/goals?${params.toString()}` : '/goals'
    const response = await axiosInstance.get<ApiResponse<GoalsResponse>>(url)
    return response.data.data
  },

  /**
   * Get goal by ID
   */
  getGoalById: async (goalId: string): Promise<Goal | null> => {
    const response = await axiosInstance.get<ApiResponse<Goal>>(`/goals/${goalId}`)
    return response.data.data
  },

  /**
   * Create a new goal
   */
  createGoal: async (payload: CreateGoalPayload): Promise<Goal> => {
    const response = await axiosInstance.post<ApiResponse<Goal>>('/goals', payload)
    return response.data.data
  },

  /**
   * Update an existing goal
   */
  updateGoal: async (goalId: string, payload: Partial<CreateGoalPayload>): Promise<Goal | null> => {
    const response = await axiosInstance.put<ApiResponse<Goal>>(`/goals/${goalId}`, payload)
    return response.data.data
  },

  /**
   * Delete a goal
   */
  deleteGoal: async (goalId: string): Promise<boolean> => {
    await axiosInstance.delete(`/goals/${goalId}`)
    return true
  },
}

export { calculateAwardTier }
