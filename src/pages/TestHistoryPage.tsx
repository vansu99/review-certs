import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTestHistory } from '@/features/tests'
import { useCategories } from '@/features/categories'
import type { TestHistoryFilters } from '@/types'
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

export const TestHistoryPage = () => {
  const [filters, setFilters] = useState<TestHistoryFilters>({
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  })
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useTestHistory(filters, page, 5)
  const { data: categories } = useCategories()

  // Get unique categories from history for filter dropdown
  const categoryOptions = useMemo(() => {
    if (!categories) return []
    return categories.map((cat) => ({ id: cat.id, name: cat.name }))
  }, [categories])

  const handleFilterChange = (key: keyof TestHistoryFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
    setPage(1) // Reset to first page when filter changes
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load test history. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📋 Test History</h1>
        <p className="text-gray-600 mt-1">Review your learning journey</p>
      </div>

      {/* Summary Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-bold text-gray-900">{data.stats.totalTests}</p>
            <p className="text-sm text-gray-500">📝 Total Tests</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-bold text-green-600">{data.stats.passedTests}</p>
            <p className="text-sm text-gray-500">✅ Passed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-bold text-red-600">{data.stats.failedTests}</p>
            <p className="text-sm text-gray-500">❌ Failed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-bold text-indigo-600">{data.stats.averageScore}%</p>
            <p className="text-sm text-gray-500">🎯 Average</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setFilters((prev) => ({
                  ...prev,
                  sortBy: sortBy as 'date' | 'score',
                  sortOrder: sortOrder as 'asc' | 'desc',
                }))
                setPage(1)
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="score-desc">Score: Highest First</option>
              <option value="score-asc">Score: Lowest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No test history found.</p>
          </div>
        ) : (
          data?.items.map((item) => (
            <Link
              key={item.id}
              to={`/tests/${item.testId}/result?attemptId=${item.attemptId}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status indicator + Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`flex-shrink-0 w-3 h-3 rounded-full ${
                        item.isPassed ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {item.testTitle}
                    </h3>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <span>{item.categoryIcon}</span>
                      {item.categoryName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4" />
                      {formatDate(item.completedAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4" />
                      {item.duration} min
                    </span>
                  </div>

                  {/* Score progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.score >= 80
                            ? 'bg-green-500'
                            : item.score >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        item.score >= 80
                          ? 'text-green-600'
                          : item.score >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {item.score}%
                    </span>
                  </div>
                </div>

                {/* Review button */}
                <div className="flex-shrink-0">
                  <span className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                    Review →
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {data.currentPage} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
