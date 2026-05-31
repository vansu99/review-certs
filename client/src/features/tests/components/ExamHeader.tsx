import {
  FlagIcon,
  ClockIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline'

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
    <div className="flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-3">
      {/* Left — question counter */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-indigo-50 rounded-lg">
          <FlagIcon className="w-4 h-4 text-indigo-600" />
        </div>
        <span className="font-semibold text-gray-900 text-[15px]">
          Question{' '}
          <span className="text-indigo-600">
            {currentQuestion}/{totalQuestions}
          </span>
        </span>
      </div>

      {/* Center — timer + actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 pl-4 pr-2 py-2 rounded-xl border border-gray-100">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <span className="font-mono font-semibold text-gray-800 text-sm tracking-wide tabular-nums">
            {formattedTime}
          </span>
          <button
            onClick={onTogglePause}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? (
              <PlayIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <PauseIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        <button
          onClick={onEndExam}
          className="px-5 py-2.5 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-bold shadow-[0_2px_10px_-3px_rgba(239,68,68,0.4)] active:scale-[0.98]"
        >
          End Exam
        </button>

        <button
          className="p-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 shadow-xs"
          aria-label="Bookmark this question"
          title="Bookmark this question"
        >
          <BookmarkIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Right — close */}
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Close exam"
      >
        <XMarkIcon className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  )
}
