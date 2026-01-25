export interface AnswerOption {
  id: string
  content: string
  isCorrect: boolean
}

export interface Question {
  id: string
  content: string
  type: 'single' | 'multiple'
  options: AnswerOption[]
  explanation?: string
}

export interface Test {
  id: string
  categoryId: string
  title: string
  description: string
  duration: number // minutes
  questionCount: number
  questions: Question[]
  createdAt?: string
  updatedAt?: string
}

export interface TestAttempt {
  id: string
  testId: string
  userId: string
  answers: Record<string, string[]> // questionId -> selected option ids
  score: number
  totalQuestions: number
  correctAnswers: number
  startedAt: string
  completedAt: string
}

export interface SubmitTestPayload {
  testId: string
  answers: Record<string, string[]>
}

export interface TestResult {
  attempt: TestAttempt
  test: Test
  correctAnswerMap: Record<string, string[]> // questionId -> correct option ids
}
