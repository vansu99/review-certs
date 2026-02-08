import type { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  selectedAnswers: string[]
  onAnswerChange: (questionId: string, optionId: string) => void
}

export const QuestionCard = ({
  question,
  questionNumber,
  selectedAnswers,
  onAnswerChange,
}: QuestionCardProps) => {
  const handleOptionClick = (optionId: string) => {
    onAnswerChange(question.id, optionId)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
      <div className="flex items-start gap-4 mb-4">
        <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
          {questionNumber}
        </span>
        <h3 className="text-lg font-medium text-gray-900">{question.content}</h3>
      </div>

      <div className="space-y-3 ml-12">
        {question.options.map((option) => {
          const isSelected = selectedAnswers.includes(option.id)

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">{option.content}</span>
            </button>
          )
        })}
      </div>

      {question.type === 'multiple' && (
        <p className="text-sm text-gray-500 mt-3 ml-12">Select all that apply</p>
      )}
    </div>
  )
}
