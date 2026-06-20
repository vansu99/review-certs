import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTestAttempt } from '@/features/tests'
import { WeaknessMap } from '@/features/tests/components/WeaknessMap'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'
import {
  Trophy,
  BookOpen,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  Target,
} from 'lucide-react'

export const TestResultPage = () => {
  const [searchParams] = useSearchParams()
  const attemptId = searchParams.get('attemptId') || ''
  const [showAllQuestions, setShowAllQuestions] = useState(false)
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all')

  const { data: result, isLoading, error } = useTestAttempt(attemptId)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load result</h2>
        <p className="text-gray-500 mb-6">Something went wrong. Please try again.</p>
        <Link to={ROUTES.CATEGORIES}>
          <Button variant="outline">Back to Categories</Button>
        </Link>
      </div>
    )
  }

  const { attempt, test, correctAnswerMap } = result
  const percentage = attempt.score
  const isPassed = percentage >= test.passingScore
  const wrongCount = attempt.totalQuestions - attempt.correctAnswers

  // Filter questions
  const filteredQuestions = test.questions.filter((question) => {
    if (filter === 'all') return true
    const userAnswer = attempt.answers[question.id] || []
    const correctAnswer = correctAnswerMap[question.id] || []
    const isCorrect =
      userAnswer.length === correctAnswer.length &&
      userAnswer.every((a: string) => correctAnswer.includes(a))
    return filter === 'correct' ? isCorrect : !isCorrect
  })

  const displayedQuestions = showAllQuestions ? filteredQuestions : filteredQuestions.slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mb-6">
        <div
          className={`p-8 md:p-10 ${
            isPassed
              ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600'
              : 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600'
          }`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-4 border-white" />
            <div className="absolute bottom-4 left-8 w-20 h-20 rounded-full border-4 border-white" />
            <div className="absolute top-1/2 right-1/3 w-12 h-12 rounded-full border-2 border-white" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Score Circle */}
            <div className="shrink-0">
              <div className="relative w-36 h-36 md:w-40 md:h-40">
                {/* SVG Ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(percentage / 100) * 327} 327`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl md:text-5xl font-bold text-white">{percentage}%</span>
                  <span className="text-xs text-white/80 font-medium mt-0.5">
                    {isPassed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                {isPassed ? (
                  <Trophy className="w-6 h-6 text-yellow-200" />
                ) : (
                  <BookOpen className="w-6 h-6 text-white/80" />
                )}
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
                </h1>
              </div>
              <p className="text-white/80 text-sm md:text-base mb-4">{test.title}</p>

              {/* Stats Row */}
              <div className="flex items-center justify-center md:justify-start gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{attempt.correctAnswers}</p>
                  <p className="text-xs text-white/70">Correct</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{wrongCount}</p>
                  <p className="text-xs text-white/70">Wrong</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{attempt.totalQuestions}</p>
                  <p className="text-xs text-white/70">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Passing Score</p>
            <p className="text-lg font-semibold text-gray-900">{test.passingScore}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-lg font-semibold text-gray-900">{test.duration} min</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isPassed ? 'bg-emerald-50' : 'bg-orange-50'
            }`}
          >
            {isPassed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-orange-600" />
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500">Result</p>
            <p
              className={`text-lg font-semibold ${isPassed ? 'text-emerald-600' : 'text-orange-600'}`}
            >
              {isPassed ? 'Passed' : 'Not Passed'}
            </p>
          </div>
        </div>
      </div>

      {/* Weakness Map */}
      <div className="mb-6">
        <WeaknessMap result={result} />
      </div>

      {/* Questions Review Section */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        {/* Section Header with Filter */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Review Answers</h3>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({test.questions.length})
              </button>
              <button
                onClick={() => setFilter('correct')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === 'correct'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Correct ({attempt.correctAnswers})
              </button>
              <button
                onClick={() => setFilter('wrong')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === 'wrong'
                    ? 'bg-white text-red-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Wrong ({wrongCount})
              </button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="divide-y divide-gray-50">
          {displayedQuestions.map((question) => {
            const originalIndex = test.questions.findIndex((q) => q.id === question.id)
            const userAnswer = attempt.answers[question.id] || []
            const correctAnswer = correctAnswerMap[question.id] || []
            const isCorrect =
              userAnswer.length === correctAnswer.length &&
              userAnswer.every((a: string) => correctAnswer.includes(a))

            return (
              <div key={question.id} className="p-5">
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {originalIndex + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                      {question.content}
                    </p>
                  </div>
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>

                {/* Options */}
                <div className="ml-10 space-y-1.5">
                  {question.options.map((option) => {
                    const wasSelected = userAnswer.includes(option.id)
                    const isCorrectOption = option.isCorrect

                    let optionClass = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm '
                    let indicator = null

                    if (isCorrectOption && wasSelected) {
                      optionClass += 'bg-green-50 border border-green-200 text-green-800'
                      indicator = <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    } else if (isCorrectOption && !wasSelected) {
                      optionClass += 'bg-green-50/50 border border-green-100 text-green-700'
                      indicator = <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    } else if (wasSelected && !isCorrectOption) {
                      optionClass +=
                        'bg-red-50 border border-red-200 text-red-800 line-through decoration-red-300'
                      indicator = <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    } else {
                      optionClass += 'bg-gray-50 border border-gray-100 text-gray-500'
                    }

                    return (
                      <div key={option.id} className={optionClass}>
                        <span className="flex-1">{option.content}</span>
                        {indicator}
                      </div>
                    )
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && !isCorrect && (
                  <div className="ml-10 mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">{question.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Show More/Less */}
        {filteredQuestions.length > 5 && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {showAllQuestions ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show All {filteredQuestions.length} Questions <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-8">
        <Link to={ROUTES.CATEGORIES}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Button>
        </Link>
        <Link to={`/tests/${attempt.testId}`}>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </Link>
      </div>
    </div>
  )
}
