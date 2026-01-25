import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { testService } from '../services'
import type { SubmitTestPayload } from '@/types'

export const TEST_QUERY_KEYS = {
  detail: (id: string) => ['tests', id] as const,
  byCategory: (categoryId: string) => ['tests', 'category', categoryId] as const,
  attempt: (attemptId: string) => ['attempts', attemptId] as const,
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
