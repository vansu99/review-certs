import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTest, useSubmitTest, QuestionCard } from '@/features/tests'
import { Button } from '@/components/ui/button'

export const TestTakingPage = () => {
  const { id: testId } = useParams<{ id: string }>()
  const { data: test, isLoading, error } = useTest(testId || '')
  const { mutate: submitTest } = useSubmitTest()

  // Track selected answers: questionId -> array of selected option ids
  const [answers, setAnswers] = useState<Record<string, string[]>>({})

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const question = test?.questions.find((q) => q.id === questionId)
      const currentAnswers = prev[questionId] || []

      if (question?.type === 'multiple') {
        // Toggle selection for multiple choice
        if (currentAnswers.includes(optionId)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((id) => id !== optionId),
          }
        }
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionId],
        }
      }

      // Single choice - replace selection
      return {
        ...prev,
        [questionId]: [optionId],
      }
    })
  }

  const handleSubmit = () => {
    if (!testId) return
    submitTest({
      testId,
      answers,
    })
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = test?.questions.length || 0

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load test. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
        <p className="text-gray-600 mb-4">{test.description}</p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span>⏱️ {test.duration} minutes</span>
          <span>📝 {totalQuestions} questions</span>
          <span className="text-indigo-600 font-medium">
            ✅ {answeredCount}/{totalQuestions} answered
          </span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {test.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            questionNumber={index + 1}
            selectedAnswers={answers[question.id] || []}
            onAnswerChange={handleAnswerChange}
          />
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSubmit} size="lg" disabled={answeredCount < totalQuestions}>
          Submit Test
        </Button>
      </div>

      {answeredCount < totalQuestions && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Please answer all questions before submitting
        </p>
      )}
    </div>
  )
}
