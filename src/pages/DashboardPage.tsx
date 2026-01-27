import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth'
import { ROUTES } from '@/constants'
import { getFormattedDate } from '@/utils/common'
import { Clock, Crosshair, Flame, NotebookPen } from 'lucide-react'

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)

  // Mock dashboard data
  const stats = {
    testsCompleted: 12,
    averageScore: 78,
    totalTime: '5h 30m',
    streak: 7,
  }

  const recentActivity = [
    { id: 1, test: 'JavaScript Basics', score: 85, date: '2024-01-14' },
    { id: 2, test: 'React Hooks', score: 92, date: '2024-01-13' },
    { id: 3, test: 'TypeScript Generics', score: 70, date: '2024-01-12' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Learner'}! 👋</h1>
        <p className="text-indigo-100">
          You're on a {stats.streak}-day learning streak. Keep it up!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col bg-white rounded-xl h-[140px] shadow-sm border border-gray-100 p-6">
          <NotebookPen className="size-8" />
          <div className="mt-auto">
            <p className="text-2xl font-bold text-gray-900">{stats.testsCompleted}</p>
            <p className="text-md text-gray-500">Tests Completed</p>
          </div>
        </div>
        <div className="flex flex-col bg-white rounded-xl h-[140px] shadow-sm border border-gray-100 p-6">
          <Crosshair className="size-8" />
          <div className="mt-auto">
            <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            <p className="text-md text-gray-500">Average Score</p>
          </div>
        </div>
        <div className="flex flex-col bg-white rounded-xl h-[140px] shadow-sm border border-gray-100 p-6">
          <Clock className="size-8" />
          <div className="mt-auto">
            <p className="text-2xl font-bold text-gray-900">{stats.totalTime}</p>
            <p className="text-md text-gray-500">Total Study Time</p>
          </div>
        </div>
        <div className="flex flex-col bg-white rounded-xl h-[140px] shadow-sm border border-gray-100 p-6">
          <Flame className="size-8" />
          <div className="mt-auto">
            <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
            <p className="text-md text-gray-500">Current Streak</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <Link
            to={ROUTES.CATEGORIES}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-[16px] text-gray-900">{activity.test}</p>
                <p className="text-sm text-gray-500">{getFormattedDate(new Date(activity.date))}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activity.score >= 80
                    ? 'bg-green-100 text-green-700'
                    : activity.score >= 60
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {activity.score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={ROUTES.CATEGORIES}
            className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">📚</span>
            <span className="font-medium text-indigo-700 text-md">Browse Categories</span>
          </Link>
          <Link
            to="/tests/1"
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">🎯</span>
            <span className="font-medium text-green-700 text-md">Quick Practice</span>
          </Link>
          <Link
            to={ROUTES.DASHBOARD}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">📊</span>
            <span className="font-medium text-purple-700 text-md">View Progress</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
