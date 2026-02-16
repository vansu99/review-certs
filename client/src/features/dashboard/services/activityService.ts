import axiosInstance from '@/lib/axios'
import type { ApiResponse } from '@/types'

/** A single day's activity count for the heatmap */
export interface HeatmapEntry {
  date: string // "YYYY-MM-DD"
  count: number
}

/** Streak statistics returned by the API */
export interface StreakData {
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  totalActivities: number
}

/**
 * Get the user's browser timezone offset formatted as "+HH:MM" / "-HH:MM"
 * for use with MySQL CONVERT_TZ
 */
function getTimezoneOffset(): string {
  const offset = new Date().getTimezoneOffset() // in minutes, e.g. -420 for +07:00
  const sign = offset <= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const hours = String(Math.floor(abs / 60)).padStart(2, '0')
  const minutes = String(abs % 60).padStart(2, '0')
  return `${sign}${hours}:${minutes}`
}

export const activityService = {
  /**
   * Fetch heatmap data (daily activity counts for past 365 days)
   */
  getHeatmap: async (): Promise<HeatmapEntry[]> => {
    const tz = getTimezoneOffset()
    const response = await axiosInstance.get<ApiResponse<HeatmapEntry[]>>(
      `/dashboard/heatmap?timezone=${encodeURIComponent(tz)}`
    )
    return response.data.data
  },

  /**
   * Fetch streak statistics
   */
  getStreak: async (): Promise<StreakData> => {
    const tz = getTimezoneOffset()
    const response = await axiosInstance.get<ApiResponse<StreakData>>(
      `/dashboard/streak?timezone=${encodeURIComponent(tz)}`
    )
    return response.data.data
  },
}
