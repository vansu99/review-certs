export type GoalStatus = 'draft' | 'active' | 'completed' | 'overdue' | 'cancelled'
export type AwardTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'perfect'
export type TargetType = 'category' | 'exams'
export type PriorityLevel = 'low' | 'medium' | 'high'

export interface GoalExamScore {
  examId: string
  examTitle: string
  score: number
  completedAt: string
}

export interface Goal {
  id: string
  name: string
  description?: string
  targetType: TargetType
  categoryId?: string
  categoryName?: string
  examIds: string[]
  examTitles?: string[]
  passingScore: number
  startDate: string
  endDate: string
  status: GoalStatus
  awardTier: AwardTier
  priority: PriorityLevel
  progress: {
    completed: number
    total: number
    percentage: number
    averageScore: number
  }
  topScores: GoalExamScore[]
  createdAt: string
  updatedAt: string
}

export interface CreateGoalPayload {
  name: string
  description?: string
  targetType: TargetType
  categoryId?: string
  examIds: string[]
  passingScore: number
  startDate: string
  endDate: string
  priority: PriorityLevel
}

export interface GoalFilters {
  status?: GoalStatus | 'all'
  priority?: PriorityLevel | 'all'
}

export interface GoalsStats {
  active: number
  completed: number
  overdue: number
  successRate: number
}

export interface GoalsResponse {
  goals: Goal[]
  stats: GoalsStats
}
