import api from '@/lib/axios'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  isUnlocked: boolean
  earnedAt: string | null
}

export const gamificationService = {
  getBadges: async (): Promise<Badge[]> => {
    const response = await api.get('/gamification/badges')
    return response.data.data || response.data // adjust based on API wrapper
  },
}
