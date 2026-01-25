import type { Test, TestAttempt, SubmitTestPayload, TestResult } from '@/types'

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
}
