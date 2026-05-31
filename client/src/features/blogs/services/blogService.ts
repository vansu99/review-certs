import axiosInstance from '@/lib/axios'
import type {
  Blog,
  BlogListItem,
  BlogLikeResponse,
  CreateBlogPayload,
  UpdateBlogPayload,
  BlogFilters,
} from '@/types'
import type { PaginatedResponse } from '@/types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const blogService = {
  // ─── Public ───────────────────────────────────────────────────────────────

  /**
   * Get published blogs (public, no auth)
   */
  getPublishedBlogs: async (
    filters: BlogFilters = {}
  ): Promise<PaginatedResponse<BlogListItem>> => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize))

    const response = await axiosInstance.get<PaginatedResponse<BlogListItem>>(
      `/blogs?${params.toString()}`
    )
    return response.data
  },

  /**
   * Get single published blog by slug (public, no auth)
   */
  getBlogBySlug: async (slug: string): Promise<Blog> => {
    const response = await axiosInstance.get<ApiResponse<Blog>>(`/blogs/slug/${slug}`)
    return response.data.data
  },

  /**
   * Toggle like on a blog (public, guest-friendly)
   */
  toggleLike: async (blogId: string): Promise<BlogLikeResponse> => {
    const response = await axiosInstance.post<ApiResponse<BlogLikeResponse>>(
      `/blogs/${blogId}/like`
    )
    return response.data.data
  },

  /**
   * Get like status for a blog
   */
  getLikeStatus: async (blogId: string): Promise<{ liked: boolean }> => {
    const response = await axiosInstance.get<ApiResponse<{ liked: boolean }>>(
      `/blogs/${blogId}/like-status`
    )
    return response.data.data
  },

  // ─── Management (auth required) ───────────────────────────────────────────

  /**
   * Get all blogs for management
   */
  getManagedBlogs: async (
    filters: BlogFilters = {}
  ): Promise<PaginatedResponse<BlogListItem>> => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize))

    const response = await axiosInstance.get<PaginatedResponse<BlogListItem>>(
      `/blogs/manage?${params.toString()}`
    )
    return response.data
  },

  /**
   * Get single blog for editing
   */
  getManagedBlogById: async (id: string): Promise<Blog> => {
    const response = await axiosInstance.get<ApiResponse<Blog>>(`/blogs/manage/${id}`)
    return response.data.data
  },

  /**
   * Create a new blog
   */
  createBlog: async (data: CreateBlogPayload): Promise<Blog> => {
    const response = await axiosInstance.post<ApiResponse<Blog>>('/blogs', data)
    return response.data.data
  },

  /**
   * Update a blog
   */
  updateBlog: async (id: string, data: UpdateBlogPayload): Promise<Blog> => {
    const response = await axiosInstance.put<ApiResponse<Blog>>(`/blogs/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a blog
   */
  deleteBlog: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/blogs/${id}`)
  },
}
