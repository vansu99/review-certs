import { useState, useEffect, useCallback, useRef } from 'react'

interface UseExamTimerProps {
  initialSeconds: number
  onTimeUp?: () => void
}

interface UseExamTimerReturn {
  timeRemaining: number
  formattedTime: string
  isPaused: boolean
  pause: () => void
  resume: () => void
  toggle: () => void
}

export const useExamTimer = ({
  initialSeconds,
  onTimeUp,
}: UseExamTimerProps): UseExamTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          onTimeUp?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer, onTimeUp])

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      startTimer()
    }
    return clearTimer
  }, [isPaused, startTimer, clearTimer, timeRemaining])

  const pause = useCallback(() => {
    setIsPaused(true)
    clearTimer()
  }, [clearTimer])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  const toggle = useCallback(() => {
    if (isPaused) {
      resume()
    } else {
      pause()
    }
  }, [isPaused, pause, resume])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isPaused,
    pause,
    resume,
    toggle,
  }
}
