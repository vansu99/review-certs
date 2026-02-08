export interface TestHistoryItem {
  id: string
  attemptId: string
  testId: string
  testTitle: string
  categoryId: string
  categoryName: string
  categoryIcon?: string
  score: number
  totalQuestions: number
  correctAnswers: number
  duration: number // minutes taken
  completedAt: string
  isPassed: boolean
}

export interface TestHistoryFilters {
  categoryId?: string
  status?: 'all' | 'passed' | 'failed'
  sortBy?: 'date' | 'score'
  sortOrder?: 'asc' | 'desc'
}

export interface TestHistoryStats {
  totalTests: number
  passedTests: number
  failedTests: number
  averageScore: number
}

export interface TestHistoryResponse {
  items: TestHistoryItem[]
  stats: TestHistoryStats
  totalPages: number
  currentPage: number
}
