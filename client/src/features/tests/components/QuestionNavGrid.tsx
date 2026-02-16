import { XMarkIcon } from '@heroicons/react/24/outline'

type QuestionStatus = 'current' | 'answered' | 'unanswered'

interface QuestionNavGridProps {
  totalQuestions: number
  currentQuestion: number
  answeredQuestions: Set<number>
  onQuestionSelect: (questionNumber: number) => void
  onClose?: () => void
}

export const QuestionNavGrid = ({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onQuestionSelect,
  onClose,
}: QuestionNavGridProps) => {
  const getQuestionStatus = (questionNumber: number): QuestionStatus => {
    if (questionNumber === currentQuestion) return 'current'
    if (answeredQuestions.has(questionNumber)) return 'answered'
    return 'unanswered'
  }

  const getButtonStyles = (status: QuestionStatus): string => {
    const base =
      'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer'

    switch (status) {
      case 'current':
        return `${base} bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300`
      case 'answered':
        return `${base} bg-emerald-100 text-emerald-700 hover:bg-emerald-200`
      case 'unanswered':
        return `${base} bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200`
    }
  }

  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1)
  const answeredCount = answeredQuestions.size

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-[15px]">Questions</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {answeredCount}/{totalQuestions} answered
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close navigation"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((num) => {
          const status = getQuestionStatus(num)
          return (
            <button
              key={num}
              onClick={() => onQuestionSelect(num)}
              className={getButtonStyles(status)}
              aria-label={`Go to question ${num}`}
              aria-current={status === 'current' ? 'true' : undefined}
            >
              {num}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-600" />
          <span className="text-[11px] text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
          <span className="text-[11px] text-gray-400">Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
          <span className="text-[11px] text-gray-400">Skipped</span>
        </div>
      </div>
    </div>
  )
}
