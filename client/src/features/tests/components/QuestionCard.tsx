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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
          {questionNumber}
        </span>
        <h3 className="text-[17px] font-bold text-gray-900 leading-relaxed">{question.content}</h3>
      </div>

      <div className="space-y-3 ml-12">
        {question.options.map((option) => {
          const isSelected = selectedAnswers.includes(option.id)

          return (
            <label
              key={option.id}
              className={`block w-full text-left p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 shadow-sm'
                  : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50/80'
              }`}
            >
              <input
                type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                name={question.id}
                checked={isSelected}
                onChange={() => handleOptionClick(option.id)}
                className="sr-only"
              />
              <span className="font-medium">{option.content}</span>
            </label>
          )
        })}
      </div>

      {question.type === 'multiple' && (
        <p className="text-sm text-gray-500 mt-3 ml-12">Select all that apply</p>
      )}
    </div>
  )
}
