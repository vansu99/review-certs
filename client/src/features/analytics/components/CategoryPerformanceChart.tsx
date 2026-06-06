import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { CategoryPerformanceItem } from '../services'

interface CategoryPerformanceChartProps {
  data: CategoryPerformanceItem[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
}

/** Truncate category names longer than 12 chars with ellipsis */
function truncateName(name: string): string {
  return name.length > 12 ? `${name.slice(0, 12)}...` : name
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: CategoryPerformanceItem
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0].payload

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-md text-sm">
      <p className="font-semibold text-gray-800 mb-1">{item.categoryName}</p>
      <p className="text-indigo-600">Avg Score: {item.averageScore}</p>
      <p className="text-emerald-600">Pass Rate: {item.passRate}%</p>
      <p className="text-gray-500">Attempts: {item.attemptCount}</p>
    </div>
  )
}

export function CategoryPerformanceChart({
  data,
  isLoading,
  error,
  onRetry,
}: CategoryPerformanceChartProps) {
  // Loading state — skeleton placeholder
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="h-5 w-48 animate-pulse bg-gray-100 rounded-xl mb-6" />
        <div className="h-48 animate-pulse bg-gray-100 rounded-xl mb-3" />
        <div className="h-4 w-32 animate-pulse bg-gray-100 rounded-xl" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center gap-3 min-h-[220px]">
        <p className="text-sm text-gray-500 text-center">
          {error.message || 'Failed to load category performance data.'}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-center min-h-[220px]">
        <p className="text-sm text-gray-400">No category data available</p>
      </div>
    )
  }

  // Chart data — apply name truncation for X-axis display
  const chartData = data.map((item) => ({
    ...item,
    displayName: truncateName(item.categoryName),
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Category Performance</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="displayName"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          />
          <Bar dataKey="averageScore" name="Avg Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="passRate" name="Pass Rate" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
