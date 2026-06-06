import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services'
import type { Period } from '../services'

/**
 * Hook to fetch score trend data for the given period
 */
export const useScoreTrend = (period: Period) => {
  return useQuery({
    queryKey: ['analytics', 'score-trend', period],
    queryFn: () => analyticsService.getScoreTrend(period),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch performance breakdown by category
 */
export const useCategoryPerformance = () => {
  return useQuery({
    queryKey: ['analytics', 'category-performance'],
    queryFn: analyticsService.getCategoryPerformance,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch correct/incorrect stats grouped by question type
 */
export const useQuestionTypeStats = () => {
  return useQuery({
    queryKey: ['analytics', 'question-type-stats'],
    queryFn: analyticsService.getQuestionTypeStats,
    staleTime: 5 * 60 * 1000,
  })
}
