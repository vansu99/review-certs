import { Link } from 'react-router-dom'
import { Clock3, FileQuestion, Gauge, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/types'

interface CategoryCardProps {
  category: Category
  canEdit?: boolean
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

const statusStyles = {
  draft: 'border-amber-200 bg-amber-50 text-amber-700',
  published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  archived: 'border-slate-200 bg-slate-100 text-slate-600',
}

export const CategoryCard = ({ category, canEdit, onEdit, onDelete }: CategoryCardProps) => {
  const status = category.status || 'published'

  return (
    <div className="relative group" aria-label={`Category: ${category.name}`}>
      <Link
        to={`/categories/${category.id}`}
        className="block h-full p-5 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-[border-color,box-shadow] duration-200"
      >
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold uppercase text-white">
              {category.icon || 'CERT'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {category.provider && (
                  <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    {category.provider}
                  </span>
                )}
                {canEdit && (
                  <Badge variant="outline" className={statusStyles[status]}>
                    {status}
                  </Badge>
                )}
              </div>

              <h3 className="mt-1 text-lg font-semibold text-gray-900">{category.name}</h3>
              {(category.certificationCode || category.version) && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {[category.certificationCode, category.version].filter(Boolean).join(' / ')}
                </p>
              )}
            </div>
          </div>

          <p className="min-h-10 text-sm leading-5 text-gray-600 line-clamp-2">
            {category.description || 'Practice exams and review material for this certification.'}
          </p>

          <div className="mt-auto grid grid-cols-3 gap-2 text-xs text-gray-600">
            <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-2">
              <FileQuestion className="h-3.5 w-3.5 text-indigo-500" />
              {category.testCount} tests
            </span>
            <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-2">
              <Gauge className="h-3.5 w-3.5 text-emerald-500" />
              {category.defaultPassingScore || 70}%
            </span>
            <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-2">
              <Clock3 className="h-3.5 w-3.5 text-amber-500" />
              {category.estimatedHours || 0}h
            </span>
          </div>
        </div>
      </Link>

      {canEdit && (
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onEdit?.(category)
            }}
            className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
            aria-label={`Edit ${category.name}`}
            title="Edit category"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onDelete?.(category)
            }}
            className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors"
            aria-label={`Archive ${category.name}`}
            title="Archive category"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
