import { useState } from 'react'
import { BarChart2 } from 'lucide-react'
import { useScoreTrend, useCategoryPerformance, useQuestionTypeStats } from '@/features/analytics'
import type { Period } from '@/features/analytics'
import { ScoreTrendChart } from '@/features/analytics/components/ScoreTrendChart'
import { CategoryPerformanceChart } from '@/features/analytics/components/CategoryPerformanceChart'
import { QuestionTypeStatsChart } from '@/features/analytics/components/QuestionTypeStatsChart'

const PERIODS: { value: Period; label: string }[] = [
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
]

export const AnalyticsPage = () => {
  const [period, setPeriod] = useState<Period>('30d')

  const scoreTrendQuery = useScoreTrend(period)
  const categoryPerformanceQuery = useCategoryPerformance()
  const questionTypeStatsQuery = useQuestionTypeStats()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">
            Track your learning progress and identify areas for improvement
          </p>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="flex items-center gap-2">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Score Trend Chart */}
      <ScoreTrendChart
        data={scoreTrendQuery.data ?? []}
        isLoading={scoreTrendQuery.isLoading}
        error={scoreTrendQuery.error}
        onRetry={() => scoreTrendQuery.refetch()}
      />

      {/* Category Performance + Question Type Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPerformanceChart
          data={categoryPerformanceQuery.data ?? []}
          isLoading={categoryPerformanceQuery.isLoading}
          error={categoryPerformanceQuery.error}
          onRetry={() => categoryPerformanceQuery.refetch()}
        />
        <QuestionTypeStatsChart
          data={questionTypeStatsQuery.data ?? []}
          isLoading={questionTypeStatsQuery.isLoading}
          error={questionTypeStatsQuery.error}
          onRetry={() => questionTypeStatsQuery.refetch()}
        />
      </div>
    </div>
  )
}
