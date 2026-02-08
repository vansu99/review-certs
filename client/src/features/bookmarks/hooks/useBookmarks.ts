import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookmarkService } from '../services'

const BOOKMARKS_QUERY_KEY = ['bookmarks']

/**
 * Hook to fetch all bookmarks for the current user
 */
export const useBookmarks = () => {
  return useQuery({
    queryKey: BOOKMARKS_QUERY_KEY,
    queryFn: bookmarkService.getBookmarks,
  })
}

/**
 * Hook to check if a test is bookmarked
 */
export const useCheckBookmark = (testId: string) => {
  return useQuery({
    queryKey: ['bookmark', testId],
    queryFn: () => bookmarkService.checkBookmark(testId),
    enabled: !!testId,
  })
}

/**
 * Hook to add a bookmark
 */
export const useAddBookmark = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (testId: string) => bookmarkService.addBookmark(testId),
    onSuccess: (_, testId) => {
      // Invalidate bookmarks list
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY })
      // Update the check bookmark query
      queryClient.setQueryData(['bookmark', testId], true)
    },
  })
}

/**
 * Hook to remove a bookmark
 */
export const useRemoveBookmark = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (testId: string) => bookmarkService.removeBookmark(testId),
    onSuccess: (_, testId) => {
      // Invalidate bookmarks list
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY })
      // Update the check bookmark query
      queryClient.setQueryData(['bookmark', testId], false)
    },
  })
}

/**
 * Hook to toggle bookmark status
 */
export const useToggleBookmark = () => {
  const addBookmark = useAddBookmark()
  const removeBookmark = useRemoveBookmark()

  const toggle = async (testId: string, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      await removeBookmark.mutateAsync(testId)
    } else {
      await addBookmark.mutateAsync(testId)
    }
  }

  return {
    toggle,
    isLoading: addBookmark.isPending || removeBookmark.isPending,
  }
}
