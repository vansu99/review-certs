import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
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
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')

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
              optionStyles += ' border-gray-200'
              if (!showAnswer) {
                optionStyles += ' hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
              } else {
                optionStyles += ' cursor-default'
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => onAnswerSelect(option.id)}
                className={optionStyles}
                disabled={showAnswer}
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
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex flex-col gap-6">
          {showNote && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Type your notes for this question here..."
              className="w-full h-32 p-4 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none resize-none text-sm text-gray-700 transition-all duration-200"
            />
          )}

          <div className="flex items-center justify-between">
            {/* Tool buttons */}
            <div className="flex items-center gap-4">
              {showAnswerEnabled && (
                <button
                  onClick={handleToggleShowAnswer}
                  className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-medium transition-colors"
                  title={showAnswer ? 'Hide Answer' : 'Show Answer'}
                >
                  {showAnswer ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                  <span className="text-sm">Answer</span>
                </button>
              )}

              <button
                onClick={() => setShowNote(!showNote)}
                className={`flex items-center gap-2 font-medium transition-colors ${
                  showNote ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
                }`}
                title={showNote ? 'Hide Note' : 'Add Note'}
              >
                <PencilSquareIcon className="size-5" />
                <span className="text-sm">Note</span>
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <button
                onClick={onNext}
                disabled={!hasNext}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                Next question
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
