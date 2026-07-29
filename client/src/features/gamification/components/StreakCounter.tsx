import React from 'react'
import { Flame } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'

export const StreakCounter: React.FC = () => {
  const { user } = useAuthStore()

  if (!user || user.current_streak === undefined) return null

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-full border border-accent/20 dark:bg-accent/20 dark:border-accent/30 shadow-sm hover:scale-110 hover:shadow-md transition-all duration-300 cursor-default group"
      title="Daily Streak"
    >
      <Flame className="w-4 h-4 fill-accent text-accent group-hover:animate-bounce" />
      <span className="font-bold text-sm">{user.current_streak}</span>
    </div>
  )
}
