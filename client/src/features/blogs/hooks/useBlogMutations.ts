import { useMutation, useQueryClient } from '@tanstack/react-query'
import { blogService } from '../services/blogService'
import { BLOG_QUERY_KEYS } from './useBlogs'
import type { CreateBlogPayload, UpdateBlogPayload } from '@/types'

export const useCreateBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBlogPayload) => blogService.createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.all })
    },
  })
}

export const useUpdateBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPayload }) =>
      blogService.updateBlog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.all })
    },
  })
}

export const useDeleteBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => blogService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.all })
    },
  })
}

export const useToggleBlogLike = (blogId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => blogService.toggleLike(blogId),
    onSuccess: (data) => {
      // Update like status cache immediately
      queryClient.setQueryData(BLOG_QUERY_KEYS.likeStatus(blogId), { liked: data.liked })
      // Invalidate blog queries to refresh like count
      queryClient.invalidateQueries({ queryKey: ['blogs', 'slug'] })
      queryClient.invalidateQueries({ queryKey: ['blogs', 'published'] })
    },
  })
}
