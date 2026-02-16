import { useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { Question } from '@/types'
import { Eye, EyeOff, Lightbulb } from 'lucide-react'

interface QuestionPanelProps {
  question: Question
  selectedAnswerId: string | null
  onAnswerSelect: (optionId: string) => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  onSubmit?: () => void
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
  onSubmit,
  showAnswerEnabled = true,
}: QuestionPanelProps) => {
  const [showAnswer, setShowAnswer] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Question Content */}
      <div className="flex-1 overflow-auto p-7">
        <p className="text-[16px] text-gray-800 leading-relaxed mb-7 font-medium">
          {question.content}
        </p>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswerId === option.id
            const isCorrect = option.isCorrect
            const showCorrectHighlight = showAnswer && isCorrect
            const showWrong = showAnswer && isSelected && !isCorrect

            return (
              <button
                key={option.id}
                onClick={() => onAnswerSelect(option.id)}
                disabled={showAnswer}
                className={`
                  w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                  flex items-center gap-3 group
                  ${
                    showCorrectHighlight
                      ? 'border-emerald-400 bg-emerald-50/70'
                      : showWrong
                        ? 'border-red-300 bg-red-50/50'
                        : isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 shadow-sm'
                          : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50/80 cursor-pointer'
                  }
                  ${showAnswer && !showCorrectHighlight && !showWrong ? 'opacity-60' : ''}
                `}
              >
                {/* Option label badge */}
                <div
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                    ${
                      showCorrectHighlight
                        ? 'bg-emerald-500 text-white'
                        : showWrong
                          ? 'bg-red-400 text-white'
                          : isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                    }
                  `}
                >
                  {showCorrectHighlight ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    optionLabels[index]
                  )}
                </div>

                {/* Option text */}
                <span
                  className={`text-[15px] leading-relaxed ${
                    showCorrectHighlight
                      ? 'text-emerald-800 font-medium'
                      : showWrong
                        ? 'text-red-700'
                        : isSelected
                          ? 'text-indigo-900 font-medium'
                          : 'text-gray-700'
                  }`}
                >
                  {option.content}
                </span>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showAnswer && question.explanation && (
          <div className="mt-5 p-4 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Explanation</p>
              <p className="text-sm text-amber-700 leading-relaxed">{question.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-7 pb-5 pt-4 border-t border-gray-100">
        {/* Note textarea */}
        {showNote && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your notes for this question…"
            className="w-full h-28 p-4 mb-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none text-sm text-gray-700 transition-all placeholder:text-gray-400"
          />
        )}

        <div className="flex items-center justify-between">
          {/* Tool buttons */}
          <div className="flex items-center gap-1">
            {showAnswerEnabled && (
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showAnswer
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
                title={showAnswer ? 'Hide Answer' : 'Show Answer'}
              >
                {showAnswer ? <Eye className="size-[18px]" /> : <EyeOff className="size-[18px]" />}
                <span>Answer</span>
              </button>
            )}

            <button
              onClick={() => setShowNote(!showNote)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showNote
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title={showNote ? 'Hide Note' : 'Add Note'}
            >
              <PencilSquareIcon className="size-[18px]" />
              <span>Note</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {hasNext ? (
              <button
                onClick={onNext}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-1.5 text-sm font-medium shadow-sm hover:shadow transition-all active:scale-[0.97]"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 stroke-2" />
              </button>
            ) : (
              <button
                onClick={onSubmit}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-[0.97]"
              >
                Submit
                <PaperAirplaneIcon className="w-4 h-4 stroke-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
