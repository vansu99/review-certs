import { Link } from 'react-router-dom'
import {
  BookmarkIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  PlusIcon,
  SignalIcon,
  UsersIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { ROUTES } from '@/constants'
import { CreateExamModal } from '@/features/tests'
import { useBookmarks, useRemoveBookmark } from '@/features/bookmarks'
import { useState } from 'react'

export const BookmarksPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: bookmarks = [], isLoading, error } = useBookmarks()
  const removeBookmark = useRemoveBookmark()

  const handleRemoveBookmark = async (testId: string) => {
    try {
      await removeBookmark.mutateAsync(testId)
    } catch (err) {
      console.error('Failed to remove bookmark:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load bookmarks. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link
            to={ROUTES.DASHBOARD}
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <BookmarkSolidIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Bookmarked Exams</h1>
          </div>
          <p className="text-gray-600 mt-1">Access your saved exams quickly.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <PlusIcon className="w-5 h-5" />
          Create Exam
        </button>
      </div>

      {/* Bookmarks list */}
      <div className="space-y-4">
        {bookmarks.length > 0 ? (
          bookmarks.map((exam) => (
            <div
              key={exam.id}
              className="group relative block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                      {exam.categoryName}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.description}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{exam.questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4" />
                      <span>{exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <SignalIcon className="w-4 h-4" />
                      <span>{exam.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-4 h-4" />
                      <span>{exam.participants?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckBadgeIcon className="w-4 h-4" />
                      <span>{exam.passingScore}% passing</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <button
                    onClick={() => handleRemoveBookmark(exam.id)}
                    disabled={removeBookmark.isPending}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove bookmark"
                  >
                    <BookmarkSolidIcon className="w-6 h-6" />
                  </button>
                  <Link
                    to={`/test/${exam.id}/exam`}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Start Exam
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <BookmarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No bookmarked exams yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Start exploring categories to bookmark exams you're interested in.
            </p>
            <Link
              to={ROUTES.CATEGORIES}
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        )}
      </div>

      <CreateExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
