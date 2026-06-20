import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react'
import type { TestResult } from '@/types'

interface WeaknessMapProps {
  result: TestResult
}

interface TopicStat {
  topic: string
  total: number
  correct: number
  percent: number
}

export const WeaknessMap = ({ result }: WeaknessMapProps) => {
  const { attempt, test, correctAnswerMap } = result

  // Group questions by topic and calculate accuracy per topic
  const topicMap = new Map<string, { total: number; correct: number }>()

  test.questions.forEach((question) => {
    const topic = question.topic || 'General'
    const userAnswer = attempt.answers[question.id] || []
    const correctAnswer = correctAnswerMap[question.id] || []
    const isCorrect =
      userAnswer.length === correctAnswer.length &&
      userAnswer.every((a) => correctAnswer.includes(a))

    const current = topicMap.get(topic) || { total: 0, correct: 0 }
    current.total++
    if (isCorrect) current.correct++
    topicMap.set(topic, current)
  })

  // Convert to array and sort by accuracy (weakest first)
  const topicStats: TopicStat[] = Array.from(topicMap.entries())
    .map(([topic, { total, correct }]) => ({
      topic,
      total,
      correct,
      percent: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.percent - b.percent)

  // Check if all topics are 100%
  const allPerfect = topicStats.every((t) => t.percent === 100)

  if (allPerfect) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Weakness Map</h3>
        </div>
        <p className="text-green-700 text-sm">
          Perfect score across all topics! No weak areas detected.
        </p>
      </div>
    )
  }

  // Determine color based on percentage
  const getBarColor = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500'
    if (percent >= 60) return 'bg-yellow-500'
    if (percent >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getTextColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-700'
    if (percent >= 60) return 'text-yellow-700'
    if (percent >= 40) return 'text-orange-700'
    return 'text-red-700'
  }

  const weakTopics = topicStats.filter((t) => t.percent < 70)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weakness Map</h3>
            <p className="text-xs text-gray-500">Accuracy by topic</p>
          </div>
        </div>
        {weakTopics.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100">
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-medium text-red-700">
              {weakTopics.length} weak {weakTopics.length === 1 ? 'topic' : 'topics'}
            </span>
          </div>
        )}
      </div>

      {/* Topic Bars */}
      <div className="space-y-3">
        {topicStats.map((stat) => (
          <div key={stat.topic} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">
                {stat.topic}
              </span>
              <span className={`text-sm font-semibold ${getTextColor(stat.percent)}`}>
                {stat.percent}%
              </span>
            </div>
            <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${getBarColor(stat.percent)}`}
                style={{ width: `${stat.percent}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {stat.correct}/{stat.total} correct
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
