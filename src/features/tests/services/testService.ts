import type {
  Test,
  TestAttempt,
  SubmitTestPayload,
  TestResult,
  TestHistoryFilters,
  TestHistoryResponse,
  TestHistoryItem,
} from '@/types'

// Mock delay for simulating API calls
const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock test data
const mockTest: Test = {
  id: '1',
  categoryId: '1',
  title: 'JavaScript Basics Quiz',
  description: 'Test your knowledge of JavaScript fundamentals',
  duration: 30,
  questionCount: 5,
  questions: [
    {
      id: 'q1',
      content: 'What is the correct way to declare a variable in JavaScript?',
      type: 'single',
      options: [
        { id: 'a', content: 'variable x = 5', isCorrect: false },
        { id: 'b', content: 'let x = 5', isCorrect: true },
        { id: 'c', content: 'v x = 5', isCorrect: false },
        { id: 'd', content: 'int x = 5', isCorrect: false },
      ],
      explanation: 'In JavaScript, you can declare variables using let, const, or var.',
    },
    {
      id: 'q2',
      content: 'Which of the following is NOT a primitive type in JavaScript?',
      type: 'single',
      options: [
        { id: 'a', content: 'string', isCorrect: false },
        { id: 'b', content: 'number', isCorrect: false },
        { id: 'c', content: 'object', isCorrect: true },
        { id: 'd', content: 'boolean', isCorrect: false },
      ],
      explanation: 'Object is a reference type, not a primitive type.',
    },
    {
      id: 'q3',
      content: 'What does === operator do in JavaScript?',
      type: 'single',
      options: [
        { id: 'a', content: 'Assignment', isCorrect: false },
        { id: 'b', content: 'Loose equality comparison', isCorrect: false },
        { id: 'c', content: 'Strict equality comparison', isCorrect: true },
        { id: 'd', content: 'Type conversion', isCorrect: false },
      ],
      explanation: '=== compares both value and type without type coercion.',
    },
    {
      id: 'q4',
      content: 'Which method adds an element to the end of an array?',
      type: 'single',
      options: [
        { id: 'a', content: 'push()', isCorrect: true },
        { id: 'b', content: 'pop()', isCorrect: false },
        { id: 'c', content: 'shift()', isCorrect: false },
        { id: 'd', content: 'unshift()', isCorrect: false },
      ],
      explanation: 'push() adds elements to the end, unshift() adds to the beginning.',
    },
    {
      id: 'q5',
      content: 'What is the output of typeof null?',
      type: 'single',
      options: [
        { id: 'a', content: '"null"', isCorrect: false },
        { id: 'b', content: '"undefined"', isCorrect: false },
        { id: 'c', content: '"object"', isCorrect: true },
        { id: 'd', content: '"number"', isCorrect: false },
      ],
      explanation: 'This is a known JavaScript quirk - typeof null returns "object".',
    },
  ],
}

export const testService = {
  /**
   * Get test by ID with all questions
   */
  getTestById: async (testId: string): Promise<Test> => {
    await mockDelay(500)
    // Return mock test (in real app, fetch from API)
    return { ...mockTest, id: testId }

    // Real API call:
    // const response = await axiosInstance.get<Test>(`/tests/${testId}`)
    // return response.data
  },

  /**
   * Get tests by category
   */
  getTestsByCategory: async (categoryId: string): Promise<Test[]> => {
    await mockDelay(400)
    return [{ ...mockTest, categoryId }]

    // Real API call:
    // const response = await axiosInstance.get<Test[]>(`/categories/${categoryId}/tests`)
    // return response.data
  },

  /**
   * Submit test answers
   */
  submitTest: async (payload: SubmitTestPayload): Promise<TestResult> => {
    await mockDelay(800)

    const test = { ...mockTest, id: payload.testId }
    let correctAnswers = 0
    const correctAnswerMap: Record<string, string[]> = {}

    // Calculate score
    test.questions.forEach((question) => {
      const correctOptions = question.options.filter((opt) => opt.isCorrect).map((opt) => opt.id)
      correctAnswerMap[question.id] = correctOptions

      const userAnswers = payload.answers[question.id] || []
      const isCorrect =
        correctOptions.length === userAnswers.length &&
        correctOptions.every((opt) => userAnswers.includes(opt))

      if (isCorrect) correctAnswers++
    })

    const attempt: TestAttempt = {
      id: 'attempt-' + Date.now(),
      testId: payload.testId,
      userId: '1',
      answers: payload.answers,
      score: Math.round((correctAnswers / test.questions.length) * 100),
      totalQuestions: test.questions.length,
      correctAnswers,
      startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      completedAt: new Date().toISOString(),
    }

    return { attempt, test, correctAnswerMap }

    // Real API call:
    // const response = await axiosInstance.post<TestResult>('/tests/submit', payload)
    // return response.data
  },

  /**
   * Get test attempt by ID
   */
  getTestAttempt: async (attemptId: string): Promise<TestResult> => {
    await mockDelay(400)

    // Mock result
    const attempt: TestAttempt = {
      id: attemptId,
      testId: '1',
      userId: '1',
      answers: { q1: ['b'], q2: ['c'], q3: ['c'], q4: ['a'], q5: ['c'] },
      score: 100,
      totalQuestions: 5,
      correctAnswers: 5,
      startedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    }

    const correctAnswerMap: Record<string, string[]> = {
      q1: ['b'],
      q2: ['c'],
      q3: ['c'],
      q4: ['a'],
      q5: ['c'],
    }

    return { attempt, test: mockTest, correctAnswerMap }

    // Real API call:
    // const response = await axiosInstance.get<TestResult>(`/attempts/${attemptId}`)
    // return response.data
  },

  /**
   * Get test history for user
   */
  getTestHistory: async (
    filters: TestHistoryFilters = {},
    page = 1,
    limit = 10
  ): Promise<TestHistoryResponse> => {
    await mockDelay(500)

    // Mock history data
    const mockHistoryItems: TestHistoryItem[] = [
      {
        id: '1',
        attemptId: 'attempt-1',
        testId: '1',
        testTitle: 'AWS Solutions Architect - Practice Exam 1',
        categoryId: 'aws',
        categoryName: 'AWS',
        categoryIcon: '☁️',
        score: 85,
        totalQuestions: 20,
        correctAnswers: 17,
        duration: 45,
        completedAt: '2026-01-25T10:30:00Z',
        isPassed: true,
      },
      {
        id: '2',
        attemptId: 'attempt-2',
        testId: '2',
        testTitle: 'JavaScript Fundamentals',
        categoryId: 'frontend',
        categoryName: 'Frontend',
        categoryIcon: '💻',
        score: 62,
        totalQuestions: 15,
        correctAnswers: 9,
        duration: 25,
        completedAt: '2026-01-24T14:20:00Z',
        isPassed: false,
      },
      {
        id: '3',
        attemptId: 'attempt-3',
        testId: '3',
        testTitle: 'React Hooks Deep Dive',
        categoryId: 'frontend',
        categoryName: 'Frontend',
        categoryIcon: '💻',
        score: 92,
        totalQuestions: 10,
        correctAnswers: 9,
        duration: 18,
        completedAt: '2026-01-23T09:15:00Z',
        isPassed: true,
      },
      {
        id: '4',
        attemptId: 'attempt-4',
        testId: '4',
        testTitle: 'TypeScript Generics',
        categoryId: 'frontend',
        categoryName: 'Frontend',
        categoryIcon: '💻',
        score: 70,
        totalQuestions: 12,
        correctAnswers: 8,
        duration: 30,
        completedAt: '2026-01-22T16:45:00Z',
        isPassed: true,
      },
      {
        id: '5',
        attemptId: 'attempt-5',
        testId: '5',
        testTitle: 'Node.js Performance',
        categoryId: 'backend',
        categoryName: 'Backend',
        categoryIcon: '🖥️',
        score: 55,
        totalQuestions: 20,
        correctAnswers: 11,
        duration: 40,
        completedAt: '2026-01-21T11:00:00Z',
        isPassed: false,
      },
      {
        id: '6',
        attemptId: 'attempt-6',
        testId: '6',
        testTitle: 'Docker & Kubernetes Basics',
        categoryId: 'devops',
        categoryName: 'DevOps',
        categoryIcon: '🐳',
        score: 78,
        totalQuestions: 15,
        correctAnswers: 12,
        duration: 35,
        completedAt: '2026-01-20T08:30:00Z',
        isPassed: true,
      },
      {
        id: '7',
        attemptId: 'attempt-7',
        testId: '7',
        testTitle: 'SQL Query Optimization',
        categoryId: 'database',
        categoryName: 'Database',
        categoryIcon: '🗄️',
        score: 88,
        totalQuestions: 18,
        correctAnswers: 16,
        duration: 42,
        completedAt: '2026-01-19T13:20:00Z',
        isPassed: true,
      },
      {
        id: '8',
        attemptId: 'attempt-8',
        testId: '8',
        testTitle: 'AWS Lambda & Serverless',
        categoryId: 'aws',
        categoryName: 'AWS',
        categoryIcon: '☁️',
        score: 45,
        totalQuestions: 20,
        correctAnswers: 9,
        duration: 50,
        completedAt: '2026-01-18T15:10:00Z',
        isPassed: false,
      },
    ]

    // Apply filters
    let filteredItems = [...mockHistoryItems]

    if (filters.categoryId) {
      filteredItems = filteredItems.filter((item) => item.categoryId === filters.categoryId)
    }

    if (filters.status === 'passed') {
      filteredItems = filteredItems.filter((item) => item.isPassed)
    } else if (filters.status === 'failed') {
      filteredItems = filteredItems.filter((item) => !item.isPassed)
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'date'
    const sortOrder = filters.sortOrder || 'desc'

    filteredItems.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.completedAt).getTime()
        const dateB = new Date(b.completedAt).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else {
        return sortOrder === 'desc' ? b.score - a.score : a.score - b.score
      }
    })

    // Calculate stats from all items (before pagination)
    const stats = {
      totalTests: mockHistoryItems.length,
      passedTests: mockHistoryItems.filter((item) => item.isPassed).length,
      failedTests: mockHistoryItems.filter((item) => !item.isPassed).length,
      averageScore: Math.round(
        mockHistoryItems.reduce((sum, item) => sum + item.score, 0) / mockHistoryItems.length
      ),
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedItems = filteredItems.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(filteredItems.length / limit)

    return {
      items: paginatedItems,
      stats,
      totalPages,
      currentPage: page,
    }
  },
}
