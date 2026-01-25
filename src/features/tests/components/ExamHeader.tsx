import { FlagIcon, ClockIcon, PauseIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ExamHeaderProps {
  currentQuestion: number
  totalQuestions: number
  formattedTime: string
  isPaused: boolean
  onTogglePause: () => void
  onEndExam: () => void
  onClose: () => void
}

export const ExamHeader = ({
  currentQuestion,
  totalQuestions,
  formattedTime,
  isPaused,
  onTogglePause,
  onEndExam,
  onClose,
}: ExamHeaderProps) => {
  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3">
      {/* Left section - Question counter */}
      <div className="flex items-center gap-2">
        <FlagIcon className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-900">
          Question {currentQuestion}/{totalQuestions}
        </span>
      </div>

      {/* Center section - Timer and controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
          <ClockIcon className="w-5 h-5 text-gray-600" />
          <span className="font-mono font-medium text-gray-900">{formattedTime}</span>
          <button
            onClick={onTogglePause}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? (
              <PlayIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <PauseIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        <button
          onClick={onEndExam}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          End Exam
        </button>
      </div>

      {/* Right section - Close button */}
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Close exam"
      >
        <XMarkIcon className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  )
}
