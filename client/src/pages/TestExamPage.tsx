import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTest, useSubmitTest } from '@/features/tests'
import { ExamHeader } from '@/features/tests/components/ExamHeader'
import { QuestionPanel } from '@/features/tests/components/QuestionPanel'
import { QuestionNavGrid } from '@/features/tests/components/QuestionNavGrid'
import { useExamTimer } from '@/features/tests/hooks/useExamTimer'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from 'sonner'
import { AlertTriangle, Send } from 'lucide-react'

export const TestExamPage = () => {
  const { id: testId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: test, isLoading, error } = useTest(testId || '')
  const submitTestMutation = useSubmitTest()

  // Current question index (0-based internally, displayed as 1-based)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Track answers: questionId -> selected option id
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Dialog states
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)

  // Timer: default 2 hours 30 minutes
  const {
    formattedTime,
    isPaused,
    toggle: togglePause,
  } = useExamTimer({
    initialSeconds: 150 * 60, // 2:30:00
    onTimeUp: () => {
      handleConfirmSubmit()
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
  const answeredCount = Object.keys(answers).length
  const unansweredCount = totalQuestions - answeredCount

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

  // Open submit dialog
  const handleEndExam = useCallback(() => {
    setShowSubmitDialog(true)
  }, [])

  // Actual submit logic
  const handleConfirmSubmit = useCallback(() => {
    if (!testId) return

    // Convert answers from Record<string, string> to Record<string, string[]>
    const formattedAnswers: Record<string, string[]> = {}
    for (const [questionId, optionId] of Object.entries(answers)) {
      formattedAnswers[questionId] = [optionId]
    }

    submitTestMutation.mutate(
      { testId, answers: formattedAnswers },
      {
        onError: () => {
          toast.error('Failed to submit exam. Please try again.')
          setShowSubmitDialog(false)
        },
      }
    )
  }, [testId, answers, submitTestMutation])

  // Close/exit handler
  const handleClose = useCallback(() => {
    setShowExitDialog(true)
  }, [])

  const handleConfirmExit = useCallback(() => {
    navigate(-1)
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
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
      <div className="flex-1 flex overflow-hidden p-6">
        <div className="max-w-7xl mx-auto w-full h-full flex gap-6 overflow-hidden">
          {/* Question Panel - Left side (approx 70%) */}
          <div className="flex-1 min-w-0 h-full overflow-y-auto">
            <QuestionPanel
              question={currentQuestion}
              selectedAnswerId={answers[currentQuestion.id] || null}
              onAnswerSelect={handleAnswerSelect}
              onPrev={goToPrev}
              onNext={goToNext}
              hasPrev={currentQuestionIndex > 0}
              hasNext={currentQuestionIndex < totalQuestions - 1}
              onSubmit={handleEndExam}
            />
          </div>

          {/* Question Navigation Grid - Right side (approx 30%) */}
          <div className="w-80 shrink-0 h-full overflow-y-auto">
            <QuestionNavGrid
              totalQuestions={totalQuestions}
              currentQuestion={currentQuestionIndex + 1}
              answeredQuestions={answeredQuestions}
              onQuestionSelect={goToQuestion}
            />
          </div>
        </div>
      </div>

      {/* Submit Confirm Dialog */}
      <ConfirmDialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Exam"
        description={
          unansweredCount > 0
            ? `You still have ${unansweredCount} unanswered question(s) out of ${totalQuestions}. Are you sure you want to submit?`
            : `You have answered all ${totalQuestions} questions. Ready to submit your exam?`
        }
        confirmLabel="Submit Exam"
        cancelLabel="Continue Exam"
        variant={unansweredCount > 0 ? 'danger' : 'primary'}
        loading={submitTestMutation.isPending}
        icon={
          unansweredCount > 0 ? (
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Send className="w-6 h-6 text-indigo-600" />
            </div>
          )
        }
      />

      {/* Exit Confirm Dialog */}
      <ConfirmDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={handleConfirmExit}
        title="Exit Exam"
        description="Are you sure you want to exit? All your progress will be lost and your answers won't be saved."
        confirmLabel="Exit Exam"
        cancelLabel="Stay"
        variant="danger"
        icon={
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
        }
      />
    </div>
  )
}
