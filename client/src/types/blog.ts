export type BlogStatus = 'draft' | 'published' | 'archived'

export interface BlogAuthor {
  name: string
  avatar?: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  description?: string
  status: BlogStatus
  startDate?: string | null
  endDate?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  likeCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  author: BlogAuthor
}

export interface BlogListItem extends Omit<Blog, 'description'> {}

export interface CreateBlogPayload {
  title: string
  description?: string
  status: BlogStatus
  start_date?: string | null
  end_date?: string | null
  meta_title?: string | null
  meta_description?: string | null
}

export interface UpdateBlogPayload extends Partial<CreateBlogPayload> {}

export interface BlogFilters {
  search?: string
  status?: BlogStatus | ''
  page?: number
  pageSize?: number
}

export interface BlogLikeResponse {
  liked: boolean
  likeCount: number
}
