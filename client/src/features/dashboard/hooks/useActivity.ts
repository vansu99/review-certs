import { useQuery } from '@tanstack/react-query'
import { activityService } from '../services'

/**
 * Hook to fetch heatmap contribution data (365 days)
 */
export const useHeatmapData = () => {
  return useQuery({
    queryKey: ['dashboard', 'heatmap'],
    queryFn: activityService.getHeatmap,
    staleTime: 5 * 60 * 1000, // 5 minutes — avoid refetching on every tab switch
  })
}

/**
 * Hook to fetch streak statistics
 */
export const useStreakData = () => {
  return useQuery({
    queryKey: ['dashboard', 'streak'],
    queryFn: activityService.getStreak,
    staleTime: 5 * 60 * 1000,
  })
}
