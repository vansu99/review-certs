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
    const baseStyles =
      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200'

    switch (status) {
      case 'current':
        return `${baseStyles} bg-cyan-500 text-white shadow-md`
      case 'answered':
        return `${baseStyles} bg-cyan-100 text-cyan-700 hover:bg-cyan-200`
      case 'unanswered':
        return `${baseStyles} bg-gray-100 text-gray-600 hover:bg-gray-200`
    }
  }

  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Questions</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close navigation"
          >
            <XMarkIcon className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Question Grid */}
      <div className="flex gap-x-2 gap-y-4 flex-wrap">
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
    </div>
  )
}
