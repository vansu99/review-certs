import { useQuery } from '@tanstack/react-query'
import { blogService } from '../services/blogService'
import type { BlogFilters } from '@/types'

export const BLOG_QUERY_KEYS = {
  all: ['blogs'] as const,
  published: (filters: BlogFilters) => ['blogs', 'published', filters] as const,
  slug: (slug: string) => ['blogs', 'slug', slug] as const,
  managed: (filters: BlogFilters) => ['blogs', 'managed', filters] as const,
  managedDetail: (id: string) => ['blogs', 'managed', id] as const,
  likeStatus: (id: string) => ['blogs', 'like-status', id] as const,
}

export const usePublishedBlogs = (filters: BlogFilters = {}) => {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.published(filters),
    queryFn: () => blogService.getPublishedBlogs(filters),
  })
}

export const useBlogBySlug = (slug: string) => {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.slug(slug),
    queryFn: () => blogService.getBlogBySlug(slug),
    enabled: !!slug,
  })
}

export const useManagedBlogs = (filters: BlogFilters = {}) => {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.managed(filters),
    queryFn: () => blogService.getManagedBlogs(filters),
  })
}

export const useManagedBlogById = (id: string) => {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.managedDetail(id),
    queryFn: () => blogService.getManagedBlogById(id),
    enabled: !!id,
  })
}

export const useBlogLikeStatus = (blogId: string) => {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.likeStatus(blogId),
    queryFn: () => blogService.getLikeStatus(blogId),
    enabled: !!blogId,
    staleTime: 0,
  })
}
