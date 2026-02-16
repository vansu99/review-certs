import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryCardProps {
  category: Category
  canEdit?: boolean
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

export const CategoryCard = ({ category, canEdit, onEdit, onDelete }: CategoryCardProps) => {
  return (
    <div className="relative group">
      <Link
        to={`/categories/${category.id}`}
        className="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
      >
        <div className="flex items-start gap-4">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{category.icon || '📚'}</span>
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
            <div className="flex items-center text-sm text-indigo-600 mt-auto">
              <span className="font-medium">{category.testCount} tests</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Edit / Delete buttons */}
      {canEdit && (
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit?.(category)
            }}
            className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
            title="Edit category"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete?.(category)
            }}
            className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors"
            title="Delete category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
