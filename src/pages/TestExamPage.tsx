import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTest } from '@/features/tests'
import { ExamHeader } from '@/features/tests/components/ExamHeader'
import { QuestionPanel } from '@/features/tests/components/QuestionPanel'
import { QuestionNavGrid } from '@/features/tests/components/QuestionNavGrid'
import { useExamTimer } from '@/features/tests/hooks/useExamTimer'

export const TestExamPage = () => {
  const { id: testId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: test, isLoading, error } = useTest(testId || '')

  // Current question index (0-based internally, displayed as 1-based)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Track answers: questionId -> selected option id
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Timer: default 2 hours 30 minutes
  const {
    formattedTime,
    isPaused,
    toggle: togglePause,
  } = useExamTimer({
    initialSeconds: 150 * 60, // 2:30:00
    onTimeUp: () => {
      handleEndExam()
    },
  })

  // Get set of answered question numbers (1-based)
  const answeredQuestions = useMemo(() => {
    if (!test) return new Set<number>()
    const answeredSet = new Set<number>()
    test.questions.forEach((q, index) => {
      if (answers[q.id]) {
        answeredSet.add(index + 1)
      }
    })
    return answeredSet
  }, [test, answers])

  // Current question (0-based index)
  const currentQuestion = test?.questions[currentQuestionIndex]
  const totalQuestions = test?.questions.length || 0

  // Navigation handlers
  const goToQuestion = useCallback(
    (questionNumber: number) => {
      if (questionNumber >= 1 && questionNumber <= totalQuestions) {
        setCurrentQuestionIndex(questionNumber - 1)
      }
    },
    [totalQuestions]
  )

  const goToPrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }, [currentQuestionIndex])

  const goToNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }, [currentQuestionIndex, totalQuestions])

  // Answer selection handler
  const handleAnswerSelect = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }))
    },
    [currentQuestion]
  )

  // End exam handler
  const handleEndExam = useCallback(() => {
    // TODO: Submit answers and navigate to results
    navigate(`/test/${testId}/result`)
  }, [navigate, testId])

  // Close handler
  const handleClose = useCallback(() => {
    if (window.confirm('Are you sure you want to exit the exam? Your progress will be lost.')) {
      navigate(-1)
    }
  }, [navigate])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // Error state
  if (error || !test || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load test. Please try again.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <ExamHeader
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        formattedTime={formattedTime}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onEndExam={handleEndExam}
        onClose={handleClose}
      />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto h-full flex gap-6">
          {/* Question Panel - Left side (approx 70%) */}
          <div className="flex-1 min-w-0">
            <QuestionPanel
              question={currentQuestion}
              selectedAnswerId={answers[currentQuestion.id] || null}
              onAnswerSelect={handleAnswerSelect}
              onPrev={goToPrev}
              onNext={goToNext}
              hasPrev={currentQuestionIndex > 0}
              hasNext={currentQuestionIndex < totalQuestions - 1}
            />
          </div>

          {/* Question Navigation Grid - Right side (approx 30%) */}
          <div className="w-80 shrink-0">
            <QuestionNavGrid
              totalQuestions={totalQuestions}
              currentQuestion={currentQuestionIndex + 1}
              answeredQuestions={answeredQuestions}
              onQuestionSelect={goToQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
