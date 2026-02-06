import { useParams, Link } from 'react-router-dom'
import { useTestsByCategory } from '@/features/tests'
import { useCategories } from '@/features/categories'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/permissions'
import {
  ChevronLeftIcon,
  ClockIcon,
  DocumentTextIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline'
import { ROUTES } from '@/constants'

export const ExamListPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { data: tests, isLoading, error } = useTestsByCategory(categoryId || '')
  const { data: categories } = useCategories()
  const { hasPermission } = usePermissions()

  const category = categories?.find((c) => c.id === categoryId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load exams. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back link and header */}
      <div>
        <Link
          to={ROUTES.CATEGORIES}
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to Categories
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category?.name || 'Exams'}</h1>
            <p className="text-gray-600 mt-1">
              {category?.description || 'Choose an exam to start'}
            </p>
          </div>
          {hasPermission(Permission.CRUD_EXAMS) && (
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Create Exam
            </button>
          )}
        </div>
      </div>

      {/* Exam list */}
      <div className="space-y-4">
        {tests && tests.length > 0 ? (
          tests.map((test) => (
            <Link
              key={test.id}
              to={`/test/${test.id}/exam`}
              className="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{test.questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4" />
                      <span>{test.duration} minutes</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // UI only: toggle bookmark
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Bookmark exam"
                  >
                    <BookmarkIcon className="w-6 h-6" />
                  </button>
                  <span className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Start Exam
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No exams available in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
