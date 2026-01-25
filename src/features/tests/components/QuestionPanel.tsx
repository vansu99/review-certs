import { useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingOutIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import type { Question } from '@/types'
import { Eye, EyeOff } from 'lucide-react'

interface QuestionPanelProps {
  question: Question
  selectedAnswerId: string | null
  onAnswerSelect: (optionId: string) => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  showAnswerEnabled?: boolean
}

export const QuestionPanel = ({
  question,
  selectedAnswerId,
  onAnswerSelect,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  showAnswerEnabled = true,
}: QuestionPanelProps) => {
  const [showAnswer, setShowAnswer] = useState(false)

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  const handleToggleShowAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      {/* Question Content */}
      <div className="flex-1 overflow-auto">
        <p className="text-gray-800 leading-relaxed mb-6">{question.content}</p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswerId === option.id
            const isCorrect = option.isCorrect
            const showCorrectHighlight = showAnswer && isCorrect

            let optionStyles =
              'w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3'

            if (showCorrectHighlight) {
              optionStyles += ' border-green-500 bg-green-50'
            } else if (isSelected) {
              optionStyles += ' border-indigo-500 bg-indigo-50'
            } else {
              optionStyles += ' border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }

            return (
              <button
                key={option.id}
                onClick={() => onAnswerSelect(option.id)}
                className={optionStyles}
              >
                {/* Radio circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 ${
                    isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                {/* Option label and content */}
                <span className="text-gray-800">
                  <span className="font-medium">{optionLabels[index]}.</span> {option.content}
                </span>
              </button>
            )
          })}
        </div>

        {/* Explanation (when showing answer) */}
        {showAnswer && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Explanation:</span> {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        {/* Show Answer Button */}
        {showAnswerEnabled && (
          <button
            onClick={handleToggleShowAnswer}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            {showAnswer ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={onNext}
              disabled={!hasNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next question
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
