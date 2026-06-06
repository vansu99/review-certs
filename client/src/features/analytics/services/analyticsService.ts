import axiosInstance from '@/lib/axios'
import type { ApiResponse } from '@/types'

export type Period = '30d' | '90d' | '6m' | '1y'

export interface ScoreTrendPoint {
  attemptId: string
  testTitle: string
  score: number
  passingScore: number
  completedAt: string
}

export interface CategoryPerformanceItem {
  categoryId: string
  categoryName: string
  categoryIcon: string | null
  averageScore: number
  passRate: number
  attemptCount: number
}

export interface QuestionTypeStatItem {
  questionType: 'single' | 'multiple'
  correctCount: number
  incorrectCount: number
  totalCount: number
}

export const analyticsService = {
  /**
   * Get score trend data for the given period
   */
  getScoreTrend: async (period: Period): Promise<ScoreTrendPoint[]> => {
    const response = await axiosInstance.get<ApiResponse<ScoreTrendPoint[]>>(
      `/analytics/score-trend?period=${period}`
    )
    return response.data.data
  },

  /**
   * Get performance breakdown by category
   */
  getCategoryPerformance: async (): Promise<CategoryPerformanceItem[]> => {
    const response = await axiosInstance.get<ApiResponse<CategoryPerformanceItem[]>>(
      '/analytics/category-performance'
    )
    return response.data.data
  },

  /**
   * Get correct/incorrect stats grouped by question type
   */
  getQuestionTypeStats: async (): Promise<QuestionTypeStatItem[]> => {
    const response = await axiosInstance.get<ApiResponse<QuestionTypeStatItem[]>>(
      '/analytics/question-type-stats'
    )
    return response.data.data
  },
}
