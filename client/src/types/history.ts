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

export interface TestAttemptHistoryItem {
  id: string
  attemptId: string
  testId: string
  attemptNumber: number
  score: number
  totalQuestions: number
  correctAnswers: number
  duration: number
  startedAt: string
  completedAt: string
  isPassed: boolean
}

export interface TestAttemptHistoryStats {
  totalAttempts: number
  passedAttempts: number
  failedAttempts: number
  averageScore: number
  bestScore: number
  lastAttemptAt: string | null
}

export interface TestAttemptHistoryResponse {
  items: TestAttemptHistoryItem[]
  stats: TestAttemptHistoryStats
  totalPages: number
  currentPage: number
}

export interface TestParticipant {
  userId: string
  name: string
  email: string
  avatar: string | null
  totalAttempts: number
  bestScore: number
  averageScore: number
  lastAttemptAt: string
  hasPassed: boolean
}

export interface TestParticipantsResponse {
  participants: TestParticipant[]
  total: number
  totalPages: number
  currentPage: number
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
