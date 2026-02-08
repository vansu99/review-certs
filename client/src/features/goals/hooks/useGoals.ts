import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalService } from '../services/goalService'
import type { GoalFilters, CreateGoalPayload } from '@/types'

export const GOAL_QUERY_KEYS = {
  all: ['goals'] as const,
  list: (filters: GoalFilters) => ['goals', 'list', filters] as const,
  detail: (id: string) => ['goals', 'detail', id] as const,
}

export const useGoals = (filters: GoalFilters = {}) => {
  return useQuery({
    queryKey: GOAL_QUERY_KEYS.list(filters),
    queryFn: () => goalService.getGoals(filters),
  })
}

export const useGoal = (goalId: string) => {
  return useQuery({
    queryKey: GOAL_QUERY_KEYS.detail(goalId),
    queryFn: () => goalService.getGoalById(goalId),
    enabled: !!goalId,
  })
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => goalService.createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEYS.all })
    },
  })
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ goalId, payload }: { goalId: string; payload: Partial<CreateGoalPayload> }) =>
      goalService.updateGoal(goalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEYS.all })
    },
  })
}

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (goalId: string) => goalService.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEYS.all })
    },
  })
}
