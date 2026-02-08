import axiosInstance from '@/lib/axios'
import type { Category } from '@/types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get<ApiResponse<Category[]>>('/categories')
    return response.data.data
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: string): Promise<Category | undefined> => {
    const response = await axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`)
    return response.data.data
  },

  /**
   * Create a new category (Admin/Manager only)
   */
  createCategory: async (data: {
    name: string
    description?: string
    icon?: string
  }): Promise<Category> => {
    const response = await axiosInstance.post<ApiResponse<Category>>('/categories', data)
    return response.data.data
  },

  /**
   * Update a category (Admin/Manager only)
   */
  updateCategory: async (
    id: string,
    data: Partial<{ name: string; description: string; icon: string }>
  ): Promise<Category> => {
    const response = await axiosInstance.put<ApiResponse<Category>>(`/categories/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a category (Admin/Manager only)
   */
  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`)
  },
}
