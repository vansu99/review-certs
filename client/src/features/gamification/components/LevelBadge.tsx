import React from 'react'
import { Star } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'

export const LevelBadge: React.FC = () => {
  const { user } = useAuthStore()

  if (!user || user.level === undefined) return null

  const xp = user.xp || 0
  const currentLevel = user.level || 1
  const nextLevelXp = 100 * Math.pow(currentLevel, 2)
  const prevLevelXp = currentLevel > 1 ? 100 * Math.pow(currentLevel - 1, 2) : 0

  const progressPercent = Math.min(
    100,
    Math.max(0, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100)
  )

  return (
    <div className="flex flex-col gap-1 w-full max-w-[150px]">
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-1 text-primary">
          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
          <span>Lvl {currentLevel}</span>
        </div>
        <span className="text-muted-foreground">{xp} XP</span>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
