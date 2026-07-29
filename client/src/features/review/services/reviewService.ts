import axiosInstance from '@/lib/axios'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export type ReviewMode = 'mistakes' | 'weak' | 'bookmarked' | 'mixed'

export interface ReviewCategorySummary {
  categoryId: string
  categoryName: string
  categoryIcon: string
  provider: string
  certificationCode: string
  level: string
  totalTests: number
  attemptedTests: number
  attemptCount: number
  averageScore: number
  passRate: number
  coverage: number
  readiness: number
}

export interface WeakTopic {
  categoryId: string
  categoryName: string
  topic: string
  totalAnswers: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  needsReview: boolean
}

export interface ReviewSummary {
  readiness: number
  dueCount: number
  weakTopicCount: number
  categories: ReviewCategorySummary[]
  weakTopics: WeakTopic[]
}

export interface ReviewQuestionOption {
  id: string
  content: string
  isCorrect: boolean
}

export interface ReviewQuestion {
  id: string
  content: string
  type: 'single' | 'multiple'
  explanation: string
  topic: string
  testId: string
  testTitle: string
  categoryId: string
  categoryName: string
  options: ReviewQuestionOption[]
}

export interface ReviewQuestionsResponse {
  mode: ReviewMode
  limit: number
  questions: ReviewQuestion[]
}

function buildParams(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') searchParams.append(key, String(value))
  })

  return searchParams.toString()
}

export const reviewService = {
  getSummary: async (categoryId?: string): Promise<ReviewSummary> => {
    const query = buildParams({ categoryId })
    const response = await axiosInstance.get<ApiResponse<ReviewSummary>>(
      `/review/summary${query ? `?${query}` : ''}`
    )
    return response.data.data
  },

  getQuestions: async ({
    categoryId,
    mode,
    limit = 20,
  }: {
    categoryId?: string
    mode: ReviewMode
    limit?: number
  }): Promise<ReviewQuestionsResponse> => {
    const query = buildParams({ categoryId, mode, limit })
    const response = await axiosInstance.get<ApiResponse<ReviewQuestionsResponse>>(
      `/review/questions?${query}`
    )
    return response.data.data
  },
}
