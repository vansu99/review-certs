import axiosInstance from '@/lib/axios'
import type {
  Test,
  SubmitTestPayload,
  TestResult,
  TestHistoryFilters,
  TestHistoryResponse,
  CreateTestPayload,
  ImportExamPayload,
} from '@/types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const testService = {
  /**
   * Get test by ID with all questions
   */
  getTestById: async (testId: string): Promise<Test> => {
    const response = await axiosInstance.get<ApiResponse<Test>>(`/tests/${testId}`)
    return response.data.data
  },

  /**
   * Get tests by category
   */
  getTestsByCategory: async (categoryId: string): Promise<Test[]> => {
    const response = await axiosInstance.get<ApiResponse<Test[]>>(`/categories/${categoryId}/tests`)
    return response.data.data
  },

  /**
   * Submit test answers
   */
  submitTest: async (payload: SubmitTestPayload): Promise<TestResult> => {
    const response = await axiosInstance.post<ApiResponse<TestResult>>('/tests/submit', payload)
    return response.data.data
  },

  /**
   * Get test attempt by ID
   */
  getTestAttempt: async (attemptId: string): Promise<TestResult> => {
    const response = await axiosInstance.get<ApiResponse<TestResult>>(`/attempts/${attemptId}`)
    return response.data.data
  },

  /**
   * Get test history for user
   */
  getTestHistory: async (
    filters: TestHistoryFilters = {},
    page = 1,
    limit = 10
  ): Promise<TestHistoryResponse> => {
    const params = new URLSearchParams()

    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    if (filters.status) params.append('status', filters.status)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
    params.append('page', String(page))
    params.append('limit', String(limit))

    const response = await axiosInstance.get<ApiResponse<TestHistoryResponse>>(
      `/history?${params.toString()}`
    )
    return response.data.data
  },

  /**
   * Create a new test (Admin/Manager only)
   */
  createTest: async (payload: CreateTestPayload): Promise<Test> => {
    // For file uploads, we would need FormData
    // For now, just send JSON
    const response = await axiosInstance.post<ApiResponse<Test>>('/tests', {
      categoryId: payload.categoryId,
      title: payload.title,
      description: payload.description,
      duration: payload.duration,
      difficulty: payload.difficulty,
      passingScore: payload.passingScore,
    })
    return response.data.data
  },

  /**
   * Update a test (Admin/Manager only)
   */
  updateTest: async (id: string, payload: Partial<CreateTestPayload>): Promise<Test> => {
    const response = await axiosInstance.put<ApiResponse<Test>>(`/tests/${id}`, payload)
    return response.data.data
  },

  /**
   * Delete a test (Admin/Manager only)
   */
  deleteTest: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/tests/${id}`)
  },

  /**
   * Import exam with questions from Excel/CSV (Admin/Manager only)
   */
  importExam: async (payload: ImportExamPayload): Promise<Test> => {
    const response = await axiosInstance.post<ApiResponse<Test>>('/tests', {
      categoryId: payload.categoryId,
      title: payload.title,
      description: payload.description,
      duration: payload.duration,
      difficulty: payload.difficulty,
      passingScore: payload.passingScore,
      questions: payload.questions,
    })
    return response.data.data
  },
}
