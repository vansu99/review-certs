import { useQuery } from '@tanstack/react-query'
import { reviewService, type ReviewMode } from '../services'

export const REVIEW_QUERY_KEYS = {
  summary: (categoryId?: string) => ['review', 'summary', categoryId || 'all'] as const,
  questions: (categoryId: string | undefined, mode: ReviewMode) =>
    ['review', 'questions', categoryId || 'all', mode] as const,
}

export const useReviewSummary = (categoryId?: string) => {
  return useQuery({
    queryKey: REVIEW_QUERY_KEYS.summary(categoryId),
    queryFn: () => reviewService.getSummary(categoryId),
  })
}

export const useReviewQuestions = (categoryId: string | undefined, mode: ReviewMode) => {
  return useQuery({
    queryKey: REVIEW_QUERY_KEYS.questions(categoryId, mode),
    queryFn: () => reviewService.getQuestions({ categoryId, mode }),
  })
}
