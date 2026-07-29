import { useMemo, useState, type ElementType } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenCheck, CheckCircle2, Layers3, Target, TimerReset } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useReviewQuestions, useReviewSummary, type ReviewMode } from '@/features/review'
import type { ReviewQuestion } from '@/features/review'

const REVIEW_MODES: Array<{ label: string; value: ReviewMode; description: string }> = [
  {
    label: 'Mistakes',
    value: 'mistakes',
    description: 'Questions you answered incorrectly before.',
  },
  {
    label: 'Weak topics',
    value: 'weak',
    description: 'Questions from topics below the mastery threshold.',
  },
  {
    label: 'Bookmarked',
    value: 'bookmarked',
    description: 'Questions from exams you saved for later.',
  },
  {
    label: 'Mixed',
    value: 'mixed',
    description: 'Recent review material from your attempts.',
  },
]

const getReadinessTone = (readiness: number) => {
  if (readiness >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (readiness >= 65) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

const StatCard = ({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string | number
  helper: string
  icon: ElementType
}) => (
  <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </div>
    <p className="mt-3 text-sm text-gray-500">{helper}</p>
  </div>
)

const QuestionCard = ({ question, index }: { question: ReviewQuestion; index: number }) => (
  <article className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
      <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
        {question.topic}
      </Badge>
      <span>{question.categoryName}</span>
      <span>/</span>
      <span>{question.testTitle}</span>
    </div>

    <h3 className="mt-3 text-base font-semibold leading-6 text-gray-900">
      {index + 1}. {question.content}
    </h3>

    <div className="mt-4 space-y-2">
      {question.options.map((option) => (
        <div
          key={option.id}
          className={`rounded-md border px-3 py-2 text-sm ${
            option.isCorrect
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-gray-100 bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-start gap-2">
            {option.isCorrect && (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
            )}
            <span>{option.content}</span>
          </div>
        </div>
      ))}
    </div>

    {question.explanation && (
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
        <span className="font-semibold text-slate-900">Explanation: </span>
        {question.explanation}
      </div>
    )}
  </article>
)

export const ReviewCenterPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [mode, setMode] = useState<ReviewMode>('mistakes')
  const categoryId = selectedCategoryId === 'all' ? undefined : selectedCategoryId
  const summaryQuery = useReviewSummary(categoryId)
  const questionsQuery = useReviewQuestions(categoryId, mode)

  const selectedMode = REVIEW_MODES.find((item) => item.value === mode)
  const topCategory = useMemo(() => {
    return summaryQuery.data?.categories?.slice().sort((a, b) => b.readiness - a.readiness)[0]
  }, [summaryQuery.data?.categories])

  if (summaryQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  if (summaryQuery.error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-red-700">
        Failed to load review data. Please try again.
      </div>
    )
  }

  const summary = summaryQuery.data
  const questions = questionsQuery.data?.questions || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Center</h1>
          <p className="mt-1 text-gray-600">
            Focus on mistakes, weak topics, and questions that move you closer to exam readiness.
          </p>
        </div>

        <div
          className={`w-fit rounded-lg border px-4 py-2 text-sm font-semibold ${getReadinessTone(
            summary?.readiness || 0
          )}`}
        >
          Readiness {summary?.readiness || 0}%
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Due Questions"
          value={summary?.dueCount || 0}
          helper="Incorrect questions ready for review."
          icon={TimerReset}
        />
        <StatCard
          label="Weak Topics"
          value={summary?.weakTopicCount || 0}
          helper="Topics below the mastery threshold."
          icon={Target}
        />
        <StatCard
          label="Best Track"
          value={topCategory ? `${topCategory.readiness}%` : '0%'}
          helper={topCategory ? topCategory.categoryName : 'No attempts yet.'}
          icon={Layers3}
        />
      </div>

      <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px] lg:items-end">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Today's Review</h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedMode?.description || 'Choose a review mode to start.'}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Track</label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All tracks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tracks</SelectItem>
                {summary?.categories.map((category) => (
                  <SelectItem key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mode</label>
            <Select value={mode} onValueChange={(value) => setMode(value as ReviewMode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REVIEW_MODES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {summary?.weakTopics.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {summary.weakTopics.slice(0, 6).map((topic) => (
              <Badge
                key={`${topic.categoryId}-${topic.topic}`}
                variant="outline"
                className={
                  topic.needsReview
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }
              >
                {topic.topic}: {topic.accuracy}%
              </Badge>
            ))}
          </div>
        ) : null}
      </section>

      {questionsQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard key={question.id} question={question} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
          <BookOpenCheck className="mx-auto h-10 w-10 text-indigo-500" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No review questions yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Take a practice exam or bookmark an exam first. Your mistakes and weak topics will show
            up here automatically.
          </p>
          <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" asChild>
            <Link to="/categories">Browse tracks</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
