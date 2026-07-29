import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { gamificationService, type Badge } from '../services/gamification.service'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'

export const BadgesGallery: React.FC = () => {
  const { data: badges, isLoading } = useQuery({
    queryKey: ['gamification-badges'],
    queryFn: gamificationService.getBadges,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges & Achievements</CardTitle>
          <CardDescription>Your unlocked achievements</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges & Achievements</CardTitle>
        <CardDescription>
          Earn badges by completing tests and keeping up your streak!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {badges?.map((badge: Badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-5 rounded-2xl border text-center transition-all duration-300 ${
                badge.isUnlocked
                  ? 'bg-primary/5 border-primary/20 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:scale-105 hover:bg-primary/10'
                  : 'bg-muted/30 border-muted opacity-60 grayscale'
              }`}
            >
              <div className="text-5xl mb-3 drop-shadow-sm transition-transform group-hover:scale-110">
                {badge.icon}
              </div>
              <h4 className="font-semibold text-sm mb-1 line-clamp-1" title={badge.name}>
                {badge.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2" title={badge.description}>
                {badge.description}
              </p>
              {badge.isUnlocked && badge.earnedAt && (
                <div className="mt-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  Earned
                </div>
              )}
            </div>
          ))}
          {(!badges || badges.length === 0) && (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              No badges available yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
