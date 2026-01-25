import type { Goal, GoalFilters, GoalsResponse, CreateGoalPayload, AwardTier } from '@/types'

const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper to calculate award tier based on average score
const calculateAwardTier = (avgScore: number): AwardTier => {
  if (avgScore >= 100) return 'perfect'
  if (avgScore >= 95) return 'diamond'
  if (avgScore >= 90) return 'gold'
  if (avgScore >= 80) return 'silver'
  return 'bronze'
}

// Mock goals data
const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    name: 'Master AWS Solutions Architect',
    description: 'Complete all AWS Solutions Architect practice exams with high scores',
    targetType: 'category',
    categoryId: 'aws',
    categoryName: 'AWS',
    examIds: ['aws-1', 'aws-2', 'aws-3', 'aws-4', 'aws-5'],
    examTitles: [
      'VPC Networking',
      'S3 & Storage',
      'EC2 Fundamentals',
      'Lambda Functions',
      'IAM Security',
    ],
    passingScore: 70,
    startDate: '2026-01-15T00:00:00Z',
    endDate: '2026-02-28T00:00:00Z',
    status: 'active',
    awardTier: 'gold',
    priority: 'high',
    progress: {
      completed: 3,
      total: 5,
      percentage: 60,
      averageScore: 88,
    },
    topScores: [
      {
        examId: 'aws-1',
        examTitle: 'VPC Networking',
        score: 92,
        completedAt: '2026-01-20T10:30:00Z',
      },
      {
        examId: 'aws-2',
        examTitle: 'S3 & Storage',
        score: 88,
        completedAt: '2026-01-22T14:00:00Z',
      },
      {
        examId: 'aws-3',
        examTitle: 'EC2 Fundamentals',
        score: 85,
        completedAt: '2026-01-24T09:15:00Z',
      },
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-24T09:15:00Z',
  },
  {
    id: 'goal-2',
    name: 'Frontend Fundamentals',
    description: 'Master JavaScript, React, and TypeScript basics',
    targetType: 'exams',
    examIds: ['js-1', 'react-1', 'ts-1'],
    examTitles: ['JavaScript Basics', 'React Hooks', 'TypeScript Generics'],
    passingScore: 80,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-01-31T00:00:00Z',
    status: 'completed',
    awardTier: 'silver',
    priority: 'medium',
    progress: {
      completed: 3,
      total: 3,
      percentage: 100,
      averageScore: 85,
    },
    topScores: [
      {
        examId: 'react-1',
        examTitle: 'React Hooks',
        score: 92,
        completedAt: '2026-01-15T11:00:00Z',
      },
      {
        examId: 'ts-1',
        examTitle: 'TypeScript Generics',
        score: 85,
        completedAt: '2026-01-18T15:30:00Z',
      },
      {
        examId: 'js-1',
        examTitle: 'JavaScript Basics',
        score: 78,
        completedAt: '2026-01-10T09:00:00Z',
      },
    ],
    createdAt: '2025-12-28T10:00:00Z',
    updatedAt: '2026-01-18T15:30:00Z',
  },
  {
    id: 'goal-3',
    name: 'DevOps Certification Prep',
    description: 'Prepare for DevOps certification with Docker and Kubernetes',
    targetType: 'category',
    categoryId: 'devops',
    categoryName: 'DevOps',
    examIds: ['devops-1', 'devops-2', 'devops-3'],
    examTitles: ['Docker Basics', 'Kubernetes Fundamentals', 'CI/CD Pipelines'],
    passingScore: 75,
    startDate: '2026-01-10T00:00:00Z',
    endDate: '2026-01-20T00:00:00Z',
    status: 'overdue',
    awardTier: 'bronze',
    priority: 'low',
    progress: {
      completed: 1,
      total: 3,
      percentage: 33,
      averageScore: 72,
    },
    topScores: [
      {
        examId: 'devops-1',
        examTitle: 'Docker Basics',
        score: 72,
        completedAt: '2026-01-15T16:00:00Z',
      },
    ],
    createdAt: '2026-01-05T12:00:00Z',
    updatedAt: '2026-01-15T16:00:00Z',
  },
]

export const goalService = {
  getGoals: async (filters: GoalFilters = {}): Promise<GoalsResponse> => {
    await mockDelay(500)

    let filteredGoals = [...mockGoals]

    if (filters.status && filters.status !== 'all') {
      filteredGoals = filteredGoals.filter((g) => g.status === filters.status)
    }

    if (filters.priority && filters.priority !== 'all') {
      filteredGoals = filteredGoals.filter((g) => g.priority === filters.priority)
    }

    const stats = {
      active: mockGoals.filter((g) => g.status === 'active').length,
      completed: mockGoals.filter((g) => g.status === 'completed').length,
      overdue: mockGoals.filter((g) => g.status === 'overdue').length,
      successRate: Math.round(
        (mockGoals.filter((g) => g.status === 'completed').length / mockGoals.length) * 100
      ),
    }

    return { goals: filteredGoals, stats }
  },

  getGoalById: async (goalId: string): Promise<Goal | null> => {
    await mockDelay(300)
    return mockGoals.find((g) => g.id === goalId) || null
  },

  createGoal: async (payload: CreateGoalPayload): Promise<Goal> => {
    await mockDelay(600)

    const newGoal: Goal = {
      id: 'goal-' + Date.now(),
      ...payload,
      status: 'active',
      awardTier: 'bronze',
      progress: {
        completed: 0,
        total: payload.examIds.length,
        percentage: 0,
        averageScore: 0,
      },
      topScores: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockGoals.push(newGoal)
    return newGoal
  },

  updateGoal: async (goalId: string, payload: Partial<CreateGoalPayload>): Promise<Goal | null> => {
    await mockDelay(400)
    const index = mockGoals.findIndex((g) => g.id === goalId)
    if (index === -1) return null

    mockGoals[index] = {
      ...mockGoals[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    }
    return mockGoals[index]
  },

  deleteGoal: async (goalId: string): Promise<boolean> => {
    await mockDelay(300)
    const index = mockGoals.findIndex((g) => g.id === goalId)
    if (index === -1) return false
    mockGoals.splice(index, 1)
    return true
  },
}

export { calculateAwardTier }
