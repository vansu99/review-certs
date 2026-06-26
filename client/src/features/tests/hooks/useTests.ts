import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { testService } from '../services'
import type { SubmitTestPayload } from '@/types'

export const TEST_QUERY_KEYS = {
  detail: (id: string) => ['tests', id] as const,
  byCategory: (categoryId: string) => ['tests', 'category', categoryId] as const,
  attempt: (attemptId: string) => ['attempts', attemptId] as const,
  attemptHistory: (testId: string) => ['tests', testId, 'history'] as const,
  participants: (testId: string) => ['tests', testId, 'participants'] as const,
  tests: () => ['tests'] as const,
}

export const useTest = (testId: string) => {
  return useQuery({
    queryKey: TEST_QUERY_KEYS.detail(testId),
    queryFn: () => testService.getTestById(testId),
    enabled: !!testId,
  })
}

export const useTestsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: TEST_QUERY_KEYS.byCategory(categoryId),
    queryFn: () => testService.getTestsByCategory(categoryId),
    enabled: !!categoryId,
  })
}

export const useSubmitTest = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: SubmitTestPayload) => testService.submitTest(payload),
    onSuccess: (data) => {
      // Navigate to result page with attempt ID
      navigate(`/tests/${data.attempt.testId}/result?attemptId=${data.attempt.id}`)
    },
  })
}

export const useTestAttempt = (attemptId: string) => {
  return useQuery({
    queryKey: TEST_QUERY_KEYS.attempt(attemptId),
    queryFn: () => testService.getTestAttempt(attemptId),
    enabled: !!attemptId,
  })
}

export const useTestHistory = (
  filters: import('@/types').TestHistoryFilters = {},
  page = 1,
  limit = 10
) => {
  return useQuery({
    queryKey: ['testHistory', filters, page, limit] as const,
    queryFn: () => testService.getTestHistory(filters, page, limit),
  })
}

export const useTestAttemptHistory = (testId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...TEST_QUERY_KEYS.attemptHistory(testId), page, limit] as const,
    queryFn: () => testService.getTestAttemptHistory(testId, page, limit),
    enabled: !!testId,
  })
}

export const useTestParticipants = (testId: string, page = 1, limit = 20, enabled = true) => {
  return useQuery({
    queryKey: [...TEST_QUERY_KEYS.participants(testId), page, limit] as const,
    queryFn: () => testService.getTestParticipants(testId, page, limit),
    enabled: !!testId && enabled,
  })
}
