import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { QuestionTypeStatItem } from '../services'

interface QuestionTypeStatsChartProps {
  data: QuestionTypeStatItem[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
}

const COLORS = {
  correct: '#10b981',   // emerald-500
  incorrect: '#f43f5e', // rose-500
}

function getQuestionTypeLabel(type: 'single' | 'multiple'): string {
  return type === 'single' ? 'Single Choice' : 'Multiple Choice'
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { name: string; value: number } }>
  item: QuestionTypeStatItem
}

function CustomTooltip({ active, payload, item }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-700 mb-1">{getQuestionTypeLabel(item.questionType)}</p>
      <p className="text-emerald-600">Correct: {item.correctCount}</p>
      <p className="text-rose-500">Incorrect: {item.incorrectCount}</p>
      <p className="text-gray-500">Total: {item.totalCount}</p>
    </div>
  )
}

interface PieChartLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieChartLabelProps) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

interface SinglePieChartProps {
  item: QuestionTypeStatItem
}

function SinglePieChart({ item }: SinglePieChartProps) {
  const chartData = [
    { name: 'Correct', value: item.correctCount },
    { name: 'Incorrect', value: item.incorrectCount },
  ]

  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-sm font-semibold text-gray-700">
        {getQuestionTypeLabel(item.questionType)}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            <Cell fill={COLORS.correct} />
            <Cell fill={COLORS.incorrect} />
          </Pie>
          <Tooltip content={<CustomTooltip item={item} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.correct }} />
          Correct ({item.correctCount})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.incorrect }} />
          Incorrect ({item.incorrectCount})
        </span>
      </div>
    </div>
  )
}

export function QuestionTypeStatsChart({
  data,
  isLoading,
  error,
  onRetry,
}: QuestionTypeStatsChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse bg-gray-100 rounded-xl h-6 w-48 mb-6" />
        <div className="animate-pulse bg-gray-100 rounded-xl h-56 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Question Type Performance</h2>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <p className="text-sm text-gray-500">{error.message || 'Failed to load question type data.'}</p>
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

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Question Type Performance</h2>
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-gray-400">No question data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-6">Question Type Performance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {data.map((item) => (
          <SinglePieChart key={item.questionType} item={item} />
        ))}
      </div>
    </div>
  )
}
