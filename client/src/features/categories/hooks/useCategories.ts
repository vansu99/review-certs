import { useQuery } from '@tanstack/react-query'
import { categoryService } from '../services'

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
  detail: (id: string) => ['categories', id] as const,
}

export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.all,
    queryFn: () => categoryService.getCategories(),
  })
}

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
  })
}
