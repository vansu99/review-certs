import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth'
import { useDashboardStats, useRecentActivity } from '@/features/dashboard'
import { ROUTES } from '@/constants'
import { getFormattedDate } from '@/utils/common'
import {
  Clock,
  Crosshair,
  Flame,
  NotebookPen,
  ArrowRight,
  BookMarked,
  FolderOpen,
  History,
  Trophy,
  TrendingUp,
} from 'lucide-react'

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentActivity(5)

  const displayStats = stats || {
    testsCompleted: 0,
    averageScore: 0,
    totalTime: '0m',
    streak: 0,
  }

  const statCards = [
    {
      label: 'Tests Completed',
      value: displayStats.testsCompleted,
      icon: NotebookPen,
      color: 'indigo',
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-600',
    },
    {
      label: 'Average Score',
      value: `${displayStats.averageScore}%`,
      icon: Crosshair,
      color: 'emerald',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Study Time',
      value: displayStats.totalTime,
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-600',
    },
    {
      label: 'Day Streak',
      value: displayStats.streak,
      icon: Flame,
      color: 'rose',
      bg: 'bg-rose-50',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-500',
      textColor: 'text-rose-500',
    },
  ]

  const quickActions = [
    {
      to: ROUTES.CATEGORIES,
      icon: FolderOpen,
      label: 'Browse Categories',
      desc: 'Explore exam topics',
      gradient: 'from-indigo-500 to-violet-500',
    },
    {
      to: ROUTES.BOOKMARKS,
      icon: BookMarked,
      label: 'Bookmarked Exams',
      desc: 'Your saved exams',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      to: ROUTES.HISTORY,
      icon: History,
      label: 'View History',
      desc: 'Past attempts',
      gradient: 'from-amber-500 to-orange-500',
    },
  ]

  const getScoreStyle = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Trophy }
    if (score >= 60) return { bg: 'bg-amber-50', text: 'text-amber-700', icon: TrendingUp }
    return { bg: 'bg-red-50', text: 'text-red-600', icon: TrendingUp }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary via-primary/90 to-primary/80 p-10 text-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        </div>
        <div className="relative">
          <p className="text-sm font-medium text-teal-200 mb-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="text-2xl font-bold mb-1.5">Welcome back, {user?.name || 'Learner'}! 👋</h1>
          <p className="text-teal-200 text-[15px]">
            {displayStats.streak > 0
              ? `You're on a ${displayStats.streak}-day learning streak. Keep going! 🔥`
              : 'Start your learning journey today!'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center`}
            >
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <p className={`text-3xl font-bold ${card.textColor} tracking-tight`}>{card.value}</p>
            )}
            <p className="text-sm text-gray-500 -mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom row: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity — takes 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-8 pt-7 pb-5">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Activity</h2>
            <Link
              to={ROUTES.HISTORY}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="px-6 pb-5">
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[60px] bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity, idx) => {
                  const scoreStyle = getScoreStyle(activity.score)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-400">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-[15px] group-hover:text-indigo-600 transition-colors">
                            {activity.test}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {getFormattedDate(new Date(activity.date))}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${scoreStyle.bg} ${scoreStyle.text}`}
                      >
                        {activity.score}%
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <NotebookPen className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 mb-2">No activity yet</p>
                <Link
                  to={ROUTES.CATEGORIES}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Take your first test
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions — takes 1/3 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 px-1 tracking-tight">Quick Actions</h2>
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center gap-4 bg-white rounded-3xl border border-gray-100 p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-linear-to-br ${action.gradient} flex items-center justify-center shrink-0 shadow-sm`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-[15px] group-hover:text-indigo-600 transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-gray-400">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
