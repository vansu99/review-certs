import { useState } from 'react'
import { useGoals } from '@/features/goals'
import { CreateGoalModal } from '@/components/goals/CreateGoalModal'
import type { GoalFilters, Goal, GoalStatus, AwardTier } from '@/types'
import { CalendarIcon, TrophyIcon, PlusIcon } from '@heroicons/react/24/outline'

const statusConfig: Record<GoalStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100' },
  active: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-100' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-600', bg: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-100' },
}

const awardConfig: Record<AwardTier, { icon: string; label: string; color: string }> = {
  bronze: { icon: '🥉', label: 'Bronze', color: 'text-amber-700' },
  silver: { icon: '🥈', label: 'Silver', color: 'text-gray-500' },
  gold: { icon: '🥇', label: 'Gold', color: 'text-yellow-500' },
  diamond: { icon: '💎', label: 'Diamond', color: 'text-cyan-500' },
  perfect: { icon: '🔥', label: 'Perfect', color: 'text-orange-500' },
}

const priorityColors = {
  low: 'border-l-gray-300',
  medium: 'border-l-yellow-400',
  high: 'border-l-red-500',
}

export const GoalsPage = () => {
  const [filters, setFilters] = useState<GoalFilters>({ status: 'all' })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data, isLoading, error } = useGoals(filters)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'Expired'
    if (diff === 0) return 'Today'
    if (diff === 1) return '1 day left'
    return `${diff} days left`
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load goals. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎯 My Goals</h1>
          <p className="text-gray-600 mt-1">Set targets and track your learning progress</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Goal
        </button>
      </div>

      {/* Stats Overview */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-bold text-blue-600">{data.stats.active}</p>
            <p className="text-md text-gray-500">🏃 Active</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-bold text-green-600">{data.stats.completed}</p>
            <p className="text-md text-gray-500">✅ Completed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-bold text-red-600">{data.stats.overdue}</p>
            <p className="text-md text-gray-500">⏰ Overdue</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-bold text-indigo-600">{data.stats.successRate}%</p>
            <p className="text-sm text-gray-500">🔥 Success Rate</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-4">
          <div className="flex-1 max-w-[200px]">
            <label className="block text-md font-medium text-gray-500 mb-1">Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as GoalStatus | 'all' })
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : data?.goals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-4">No goals found. Start by creating your first goal!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Goal
            </button>
          </div>
        ) : (
          data?.goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} formatDate={formatDate} getDaysLeft={getDaysLeft} />
          ))
        )}
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

// Goal Card Component
interface GoalCardProps {
  goal: Goal
  formatDate: (date: string) => string
  getDaysLeft: (date: string) => string
}

const GoalCard = ({ goal, formatDate, getDaysLeft }: GoalCardProps) => {
  const status = statusConfig[goal.status]
  const award = awardConfig[goal.awardTier]

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 ${priorityColors[goal.priority]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
            >
              {status.label}
            </span>
          </div>
          {goal.description && <p className="text-sm text-gray-600">{goal.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{award.icon}</span>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4" />
          {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
        </span>
        <span
          className={`font-medium ${goal.status === 'overdue' ? 'text-red-600' : 'text-gray-600'}`}
        >
          {getDaysLeft(goal.endDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <TrophyIcon className="w-4 h-4" />
          Award: {award.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {goal.progress.percentage}% ({goal.progress.completed}/{goal.progress.total} exams)
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              goal.progress.percentage >= 100
                ? 'bg-green-500'
                : goal.progress.percentage >= 50
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
            }`}
            style={{ width: `${goal.progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Top Scores */}
      {goal.topScores.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">📋 Top Scores</h4>
          <div className="space-y-1">
            {goal.topScores.slice(0, 3).map((score, index) => (
              <div key={score.examId} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {index + 1}. {score.examTitle}
                </span>
                <span
                  className={`font-medium ${
                    score.score >= 90
                      ? 'text-green-600'
                      : score.score >= 70
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                  }`}
                >
                  {score.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
