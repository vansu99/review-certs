import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { ScoreTrendPoint } from '../services'

interface ScoreTrendChartProps {
  data: ScoreTrendPoint[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: ScoreTrendPoint
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const point = payload[0].payload

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1 max-w-[200px] truncate">{point.testTitle}</p>
      <p className="text-indigo-600">
        Score: <span className="font-medium">{point.score}</span>
      </p>
      <p className="text-red-500">
        Passing: <span className="font-medium">{point.passingScore}</span>
      </p>
    </div>
  )
}

export function ScoreTrendChart({ data, isLoading, error, onRetry }: ScoreTrendChartProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="animate-pulse bg-gray-100 rounded-xl h-6 w-40" />
        <div className="animate-pulse bg-gray-100 rounded-xl h-4 w-56" />
        <div className="animate-pulse bg-gray-100 rounded-xl h-56 w-full" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Score Trend</h3>
        <p className="text-sm text-gray-500 mb-4">Your score progression over time</p>
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <p className="text-sm text-red-500">
            {error.message || 'Failed to load score trend data'}
          </p>
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Score Trend</h3>
        <p className="text-sm text-gray-500 mb-4">Your score progression over time</p>
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-gray-400">No data for this period</p>
        </div>
      </div>
    )
  }

  // Chart state
  const lastPoint = data[data.length - 1]
  const chartData = data.map((point) => ({
    ...point,
    formattedDate: format(new Date(point.completedAt), 'dd/MM'),
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Score Trend</h3>
      <p className="text-sm text-gray-500 mb-6">Your score progression over time</p>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={lastPoint.passingScore}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{
              value: `Pass ${lastPoint.passingScore}`,
              position: 'insideTopRight',
              fontSize: 11,
              fill: '#ef4444',
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
