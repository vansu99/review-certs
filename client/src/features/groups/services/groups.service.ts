import api from '@/lib/axios'

export interface Group {
  id: string
  owner_id: string
  name: string
  description: string
  created_at: string
  memberCount: number
  role?: 'Admin' | 'Member'
}

export interface GroupMember {
  id: string
  name: string
  email: string
  avatar: string
  role: 'Admin' | 'Member'
  joined_at: string
}

export interface GroupExam {
  id: string
  title: string
  difficulty: string
  categoryName: string
}

export interface GroupDetail extends Group {
  members: GroupMember[]
  exams: GroupExam[]
  progress: number
  userRole: 'Admin' | 'Member'
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  examsCompleted: number
  totalScore: number
}

export interface GroupDiscussion {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  parentId: string | null
  created_at: string
}

export const groupsService = {
  getGroups: async () => {
    const response = await api.get('/groups')
    return response.data.data as Group[]
  },

  getGroup: async (id: string) => {
    const response = await api.get(`/groups/${id}`)
    return response.data.data as GroupDetail
  },

  createGroup: async (data: { name: string; description?: string }) => {
    const response = await api.post('/groups', data)
    return response.data.data as Group
  },

  addMember: async (groupId: string, identifier: string) => {
    const response = await api.post(`/groups/${groupId}/members`, { identifier })
    return response.data.data
  },

  addExams: async (groupId: string, testIds: string[]) => {
    const response = await api.post(`/groups/${groupId}/exams`, { testIds })
    return response.data.data
  },

  removeExam: async (groupId: string, testId: string) => {
    const response = await api.delete(`/groups/${groupId}/exams/${testId}`)
    return response.data.data
  },

  resetProgress: async (groupId: string) => {
    const response = await api.post(`/groups/${groupId}/reset`)
    return response.data.data
  },

  getLeaderboard: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/leaderboard`)
    return response.data.data as LeaderboardEntry[]
  },

  getDiscussions: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/discussions`)
    return response.data.data as GroupDiscussion[]
  },

  postComment: async (groupId: string, content: string, parentId?: string) => {
    const response = await api.post(`/groups/${groupId}/discussions`, { content, parentId })
    return response.data.data
  },
}
