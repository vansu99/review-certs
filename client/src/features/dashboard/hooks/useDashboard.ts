import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services'

/**
 * Hook to fetch dashboard stats
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
  })
}

/**
 * Hook to fetch recent activity
 */
export const useRecentActivity = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: () => dashboardService.getRecentActivity(limit),
  })
}
