import axiosInstance from '@/lib/axios'
import type { ApiResponse } from '@/types'

export interface Bookmark {
  id: string
  bookmarkId: string
  title: string
  description: string
  duration: number
  difficulty: string
  passingScore: number
  categoryName: string
  categoryIcon: string
  questionCount: number
  participants: number
  bookmarkedAt: string
}

export interface CheckBookmarkResponse {
  isBookmarked: boolean
}

export interface AddBookmarkResponse {
  id: string
  testId: string
}

export const bookmarkService = {
  /**
   * Get all bookmarks for the current user
   */
  getBookmarks: async (): Promise<Bookmark[]> => {
    const response = await axiosInstance.get<ApiResponse<Bookmark[]>>('/bookmarks')
    return response.data.data
  },

  /**
   * Add a test to bookmarks
   */
  addBookmark: async (testId: string): Promise<AddBookmarkResponse> => {
    const response = await axiosInstance.post<ApiResponse<AddBookmarkResponse>>('/bookmarks', {
      testId,
    })
    return response.data.data
  },

  /**
   * Remove a bookmark
   */
  removeBookmark: async (testId: string): Promise<void> => {
    await axiosInstance.delete(`/bookmarks/${testId}`)
  },

  /**
   * Check if a test is bookmarked
   */
  checkBookmark: async (testId: string): Promise<boolean> => {
    const response = await axiosInstance.get<ApiResponse<CheckBookmarkResponse>>(
      `/bookmarks/check/${testId}`
    )
    return response.data.data.isBookmarked
  },
}
