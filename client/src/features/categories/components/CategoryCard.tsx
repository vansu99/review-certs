import { Link } from 'react-router-dom'
import type { Category } from '@/types'

interface CategoryCardProps {
  category: Category
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link
      to={`/categories/${category.id}`}
      className="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
          <div className="flex items-center text-sm text-indigo-600 mt-auto">
            <span className="font-medium">{category.testCount} tests</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
