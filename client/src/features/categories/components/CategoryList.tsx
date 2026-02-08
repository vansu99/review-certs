import { CategoryCard } from './CategoryCard'
import type { Category } from '@/types'

interface CategoryListProps {
  categories: Category[]
}

export const CategoryList = ({ categories }: CategoryListProps) => {
  if (categories?.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No categories available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}
