import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsService } from '../services/groups.service'

export const GROUP_QUERY_KEYS = {
  all: ['groups'] as const,
  list: () => ['groups', 'list'] as const,
  detail: (id: string) => ['groups', 'detail', id] as const,
  leaderboard: (id: string) => ['groups', 'leaderboard', id] as const,
  discussions: (id: string) => ['groups', 'discussions', id] as const,
}

export const useGroups = () => {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.list(),
    queryFn: () => groupsService.getGroups(),
  })
}

export const useGroup = (id: string) => {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.detail(id),
    queryFn: () => groupsService.getGroup(id),
    enabled: !!id,
  })
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => groupsService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.all })
    },
  })
}

export const useAddMember = (groupId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (identifier: string) => groupsService.addMember(groupId, identifier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.detail(groupId) })
    },
  })
}

export const useAddGroupExams = (groupId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (testIds: string[]) => groupsService.addExams(groupId, testIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.detail(groupId) })
    },
  })
}

export const useRemoveGroupExam = (groupId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (testId: string) => groupsService.removeExam(groupId, testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.detail(groupId) })
    },
  })
}

export const useResetGroupProgress = (groupId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => groupsService.resetProgress(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.detail(groupId) })
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.leaderboard(groupId) })
    },
  })
}

export const useGroupLeaderboard = (groupId: string) => {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.leaderboard(groupId),
    queryFn: () => groupsService.getLeaderboard(groupId),
    enabled: !!groupId,
  })
}

export const useGroupDiscussions = (groupId: string) => {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.discussions(groupId),
    queryFn: () => groupsService.getDiscussions(groupId),
    enabled: !!groupId,
  })
}

export const usePostComment = (groupId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      groupsService.postComment(groupId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.discussions(groupId) })
    },
  })
}
