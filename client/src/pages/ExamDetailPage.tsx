import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTest, useTestAttemptHistory, useTestParticipants } from '@/features/tests'
import { useCategories } from '@/features/categories'
import { useBookmarks, useAddBookmark, useRemoveBookmark } from '@/features/bookmarks'
import { usePermissions } from '@/hooks/usePermissions'
import {
  ArrowLeft,
  Play,
  Bookmark,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Trophy,
  Users,
  RotateCcw,
  TrendingUp,
  Crown,
} from 'lucide-react'

export const ExamDetailPage = () => {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { isAdmin } = usePermissions()
  const { data: test, isLoading: isTestLoading, error: testError } = useTest(examId || '')
  const { data: categories } = useCategories()
  const { data: bookmarks = [] } = useBookmarks()
  const addBookmark = useAddBookmark()
  const removeBookmark = useRemoveBookmark()

  const [historyPage, setHistoryPage] = useState(1)
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useTestAttemptHistory(examId || '', historyPage, 5)

  const [participantsPage, setParticipantsPage] = useState(1)
  const { data: participantsData, isLoading: isParticipantsLoading } = useTestParticipants(
    examId || '',
    participantsPage,
    10,
    isAdmin
  )

  const category = categories?.find((c) => c.id === test?.categoryId)
  const isBookmarked = bookmarks.some((b) => b.id === examId)

  const handleToggleBookmark = async () => {
    if (!examId) return
    try {
      if (isBookmarked) {
        await removeBookmark.mutateAsync(examId)
      } else {
        await addBookmark.mutateAsync(examId)
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    }
  }

  const getDifficultyConfig = (difficulty: string) => {
    const d = difficulty?.toLowerCase()
    if (d === 'beginner' || d === 'easy')
      return {
        label: 'Beginner',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        ring: 'ring-emerald-100',
      }
    if (d === 'intermediate' || d === 'medium')
      return {
        label: 'Intermediate',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        ring: 'ring-amber-100',
      }
    return { label: 'Advanced', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-100' }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Loading
  if (isTestLoading) {
    return (
      <div className="space-y-5">
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse mb-4" />
          <div className="h-7 w-56 bg-gray-200 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (testError || !test) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Exam not found</h2>
        <p className="text-sm text-gray-400 mb-6">This exam doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    )
  }

  const difficulty = getDifficultyConfig(test.difficulty)
  const hasAttempts = historyData && historyData.stats.totalAttempts > 0
  const passRate = hasAttempts
    ? Math.round((historyData.stats.passedAttempts / historyData.stats.totalAttempts) * 100)
    : 0

  return (
    <div className="space-y-5">
      {/* Back navigation */}
      <Link
        to={category ? `/categories/${category.id}` : '/categories'}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {category?.name || 'Categories'}
      </Link>

      {/* Main content — 2 column on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Exam info (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Exam card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${difficulty.bg} ${difficulty.color} ${difficulty.ring}`}
                >
                  {difficulty.label}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">{test.title}</h1>
                {test.description && (
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{test.description}</p>
                )}
              </div>
              <button
                onClick={handleToggleBookmark}
                disabled={addBookmark.isPending || removeBookmark.isPending}
                className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                  isBookmarked
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'border-gray-200 text-gray-300 hover:text-indigo-600 hover:border-indigo-200'
                } disabled:opacity-50`}
              >
                <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="text-center p-3.5 rounded-xl bg-slate-50">
                <HelpCircle className="w-4.5 h-4.5 text-slate-400 mx-auto mb-1.5" />
                <p className="text-lg font-bold text-gray-900">{test.questionCount}</p>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                  Questions
                </p>
              </div>
              <div className="text-center p-3.5 rounded-xl bg-slate-50">
                <Clock className="w-4.5 h-4.5 text-slate-400 mx-auto mb-1.5" />
                <p className="text-lg font-bold text-gray-900">{test.duration}</p>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                  Minutes
                </p>
              </div>
              <div className="text-center p-3.5 rounded-xl bg-slate-50">
                <Trophy className="w-4.5 h-4.5 text-slate-400 mx-auto mb-1.5" />
                <p className="text-lg font-bold text-gray-900">{test.passingScore}%</p>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                  To Pass
                </p>
              </div>
              <div className="text-center p-3.5 rounded-xl bg-slate-50">
                <Users className="w-4.5 h-4.5 text-slate-400 mx-auto mb-1.5" />
                <p className="text-lg font-bold text-gray-900">
                  {test.participants.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                  Taken
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-7">
              <Link
                to={`/test/${test.id}/exam`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-[0_4px_12px_-2px_rgba(79,70,229,0.35)] active:scale-[0.97]"
              >
                {hasAttempts ? (
                  <>
                    <RotateCcw className="w-4.5 h-4.5" />
                    Retake Exam
                  </>
                ) : (
                  <>
                    <Play className="w-4.5 h-4.5" fill="currentColor" />
                    Start Exam
                  </>
                )}
              </Link>
            </div>
          </div>

          {/* History section */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-6 sm:px-8 py-5 border-b border-gray-50">
              <h2 className="text-[15px] font-bold text-gray-900">Your Attempts</h2>
            </div>

            <div className="p-4 sm:p-6">
              {isHistoryLoading ? (
                <div className="space-y-2.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-[60px] bg-gray-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : historyError ? (
                <div className="text-center py-12">
                  <XCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Could not load history</p>
                </div>
              ) : !hasAttempts ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">No attempts yet</p>
                  <p className="text-xs text-gray-400">Start the exam to track your progress</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {historyData?.items.map((attempt) => (
                      <Link
                        key={attempt.id}
                        to={`/tests/${attempt.testId}/result?attemptId=${attempt.attemptId}`}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                      >
                        {/* Status */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            attempt.isPassed
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-red-50 text-red-400'
                          }`}
                        >
                          {attempt.isPassed ? (
                            <CheckCircle2 className="w-4.5 h-4.5" />
                          ) : (
                            <XCircle className="w-4.5 h-4.5" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                            Attempt #{attempt.attemptNumber}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(attempt.completedAt)}
                            </span>
                            <span>
                              {attempt.correctAnswers}/{attempt.totalQuestions} correct
                            </span>
                            <span>{attempt.duration} min</span>
                          </div>
                        </div>

                        {/* Score bar */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-20 hidden sm:block">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  attempt.isPassed ? 'bg-emerald-500' : 'bg-red-400'
                                }`}
                                style={{ width: `${attempt.score}%` }}
                              />
                            </div>
                          </div>
                          <span
                            className={`text-sm font-bold min-w-[3ch] text-right ${
                              attempt.isPassed ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {attempt.score}%
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {historyData && historyData.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        disabled={historyPage === 1}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-medium text-gray-400 px-2">
                        Page {historyPage} of {historyData.totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setHistoryPage((p) => Math.min(historyData.totalPages, p + 1))
                        }
                        disabled={historyPage === historyData.totalPages}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Participants — Admin only */}
          {isAdmin && (
            <div className="bg-white rounded-2xl border border-gray-100">
              <div className="px-6 sm:px-8 py-5 border-b border-gray-50 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <h2 className="text-[15px] font-bold text-gray-900">Participants</h2>
                {participantsData && (
                  <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {participantsData.total}
                  </span>
                )}
              </div>

              <div className="p-4 sm:p-6">
                {isParticipantsLoading ? (
                  <div className="space-y-2.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : !participantsData || participantsData.participants.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No one has taken this exam yet</p>
                  </div>
                ) : (
                  <>
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <span>User</span>
                      <span className="w-16 text-center">Attempts</span>
                      <span className="w-16 text-center">Best</span>
                      <span className="w-16 text-center">Status</span>
                    </div>

                    <div className="space-y-1">
                      {participantsData.participants.map((p) => (
                        <div
                          key={p.userId}
                          className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {/* User info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-xs font-bold text-indigo-600">
                              {p.avatar ? (
                                <img
                                  src={p.avatar}
                                  alt={p.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                p.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400 truncate">{p.email}</p>
                            </div>
                          </div>

                          {/* Attempts */}
                          <span className="w-16 text-center text-sm font-medium text-gray-600">
                            {p.totalAttempts}
                          </span>

                          {/* Best score */}
                          <span
                            className={`w-16 text-center text-sm font-bold ${
                              p.hasPassed ? 'text-emerald-600' : 'text-gray-600'
                            }`}
                          >
                            {p.bestScore}%
                          </span>

                          {/* Status */}
                          <div className="w-16 flex justify-center">
                            {p.hasPassed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="w-3 h-3" />
                                Pass
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-500">
                                <XCircle className="w-3 h-3" />
                                Fail
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {participantsData.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-gray-50">
                        <button
                          onClick={() => setParticipantsPage((p) => Math.max(1, p - 1))}
                          disabled={participantsPage === 1}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-medium text-gray-400 px-2">
                          Page {participantsPage} of {participantsData.totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setParticipantsPage((p) => Math.min(participantsData.totalPages, p + 1))
                          }
                          disabled={participantsPage === participantsData.totalPages}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar (1/3) — Score summary */}
        <div className="space-y-5">
          {hasAttempts && historyData ? (
            <>
              {/* Score ring */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <div className="relative w-28 h-28 mx-auto mb-4">
                  {/* Background ring */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={
                        historyData.stats.bestScore >= test.passingScore ? '#10b981' : '#f59e0b'
                      }
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(historyData.stats.bestScore / 100) * 314} 314`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {historyData.stats.bestScore}%
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      Best
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {historyData.stats.bestScore >= test.passingScore ? (
                    <span className="text-emerald-600">You passed this exam!</span>
                  ) : (
                    <span className="text-amber-600">Keep practicing!</span>
                  )}
                </p>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Attempts</span>
                  <span className="text-sm font-bold text-gray-900">
                    {historyData.stats.totalAttempts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Passed</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {historyData.stats.passedAttempts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Failed</span>
                  <span className="text-sm font-bold text-red-500">
                    {historyData.stats.failedAttempts}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Average Score</span>
                  <span className="text-sm font-bold text-gray-900">
                    {historyData.stats.averageScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Pass Rate</span>
                  <span className="text-sm font-bold text-gray-900">{passRate}%</span>
                </div>
              </div>
            </>
          ) : (
            /* Motivational card when no attempts */
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Ready to start?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Take this exam to track your progress and see detailed analytics here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
