import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTestHistory } from '@/features/tests'
import { useCategories } from '@/features/categories'
import type { TestHistoryFilters } from '@/types'
import {
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Trophy,
  XCircle,
  Target,
  ListChecks,
  SlidersHorizontal,
  FileText,
} from 'lucide-react'

export const TestHistoryPage = () => {
  const [filters, setFilters] = useState<TestHistoryFilters>({
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  })
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useTestHistory(filters, page, 5)
  const { data: categories } = useCategories()

  const categoryOptions = useMemo(() => {
    if (!categories) return []
    return categories.map((cat) => ({ id: cat.id, name: cat.name }))
  }, [categories])

  const handleFilterChange = (key: keyof TestHistoryFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
    setPage(1)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' }
    if (score >= 60) return { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' }
    return { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' }
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-gray-600 font-medium">Failed to load test history</p>
        <p className="text-sm text-gray-400 mt-1">Please try again later</p>
      </div>
    )
  }

  const summaryStats = data?.stats
    ? [
        {
          label: 'Total Tests',
          value: data.stats.totalTests,
          icon: ListChecks,
          iconBg: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
          valueColor: 'text-gray-900',
        },
        {
          label: 'Passed',
          value: data.stats.passedTests,
          icon: Trophy,
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          valueColor: 'text-emerald-600',
        },
        {
          label: 'Failed',
          value: data.stats.failedTests,
          icon: XCircle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-500',
          valueColor: 'text-red-500',
        },
        {
          label: 'Average',
          value: `${data.stats.averageScore}%`,
          icon: Target,
          iconBg: 'bg-violet-100',
          iconColor: 'text-violet-600',
          valueColor: 'text-violet-600',
        },
      ]
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Test History</h1>
        <p className="text-gray-400 text-sm mt-1">Review your learning journey and past attempts</p>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5"
            >
              <div
                className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}
              >
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${s.valueColor}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-500">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.categoryId || ''}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
          >
            <option value="all">All Status</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>

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
            className="flex-1 min-w-[160px] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
          >
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="score-desc">Score: Highest First</option>
            <option value="score-asc">Score: Lowest First</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-full bg-gray-100 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : data?.items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No test history found</p>
            <p className="text-sm text-gray-400">Start taking tests to see your results here</p>
          </div>
        ) : (
          data?.items.map((item) => {
            const scoreColor = getScoreColor(item.score)
            return (
              <Link
                key={item.id}
                to={`/tests/${item.testId}/result?attemptId=${item.attemptId}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  {/* Status indicator */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      item.isPassed ? 'bg-emerald-50' : 'bg-red-50'
                    }`}
                  >
                    {item.isPassed ? (
                      <Trophy className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {item.testTitle}
                      </h3>
                      <span
                        className={`shrink-0 px-3 py-1 rounded-lg text-sm font-bold ${scoreColor.bg} ${scoreColor.text}`}
                      >
                        {item.score}%
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        {item.categoryIcon} {item.categoryName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.completedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.duration} min
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreColor.bar} transition-all duration-500`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {item.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                p === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
