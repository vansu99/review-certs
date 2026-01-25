import { useSearchParams, Link } from 'react-router-dom'
import { useTestAttempt } from '@/features/tests'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants'

export const TestResultPage = () => {
  const [searchParams] = useSearchParams()
  const attemptId = searchParams.get('attemptId') || ''

  const { data: result, isLoading, error } = useTestAttempt(attemptId)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load test result. Please try again.</p>
      </div>
    )
  }

  const { attempt, test, correctAnswerMap } = result
  const percentage = attempt.score
  const isPassed = percentage >= 70

  return (
    <div className="max-w-3xl mx-auto">
      {/* Result Summary */}
      <div
        className={`rounded-2xl p-8 text-center mb-8 ${
          isPassed
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
            : 'bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200'
        }`}
      >
        <div className="text-6xl mb-4">{isPassed ? '🎉' : '📚'}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isPassed ? 'Congratulations!' : 'Keep Learning!'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isPassed
            ? 'You passed the test successfully!'
            : "You didn't pass this time, but practice makes perfect!"}
        </p>

        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-lg mb-4">
          <span className={`text-4xl font-bold ${isPassed ? 'text-green-600' : 'text-orange-600'}`}>
            {percentage}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{attempt.correctAnswers}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {attempt.totalQuestions - attempt.correctAnswers}
            </p>
            <p className="text-sm text-gray-500">Wrong</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{attempt.totalQuestions}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>
      </div>

      {/* Test Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{test.title}</h2>
        <p className="text-gray-600 mb-4">{test.description}</p>
      </div>

      {/* Questions Review */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-900">Review Your Answers</h3>

        {test.questions.map((question, index) => {
          const userAnswer = attempt.answers[question.id] || []
          const correctAnswer = correctAnswerMap[question.id] || []
          const isCorrect =
            userAnswer.length === correctAnswer.length &&
            userAnswer.every((a) => correctAnswer.includes(a))

          return (
            <div
              key={question.id}
              className={`bg-white rounded-xl border-2 p-6 ${
                isCorrect ? 'border-green-200' : 'border-red-200'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isCorrect ? '✓' : '✗'}
                </span>
                <h4 className="font-medium text-gray-900">
                  {index + 1}. {question.content}
                </h4>
              </div>

              <div className="ml-12 space-y-2">
                {question.options.map((option) => {
                  const wasSelected = userAnswer.includes(option.id)
                  const isCorrectOption = option.isCorrect

                  let className = 'p-3 rounded-lg border text-sm '
                  if (isCorrectOption) {
                    className += 'bg-green-50 border-green-300 text-green-800'
                  } else if (wasSelected && !isCorrectOption) {
                    className += 'bg-red-50 border-red-300 text-red-800'
                  } else {
                    className += 'bg-gray-50 border-gray-200 text-gray-600'
                  }

                  return (
                    <div key={option.id} className={className}>
                      {option.content}
                      {isCorrectOption && <span className="ml-2 text-green-600">✓ Correct</span>}
                      {wasSelected && !isCorrectOption && (
                        <span className="ml-2 text-red-600">✗ Your answer</span>
                      )}
                    </div>
                  )
                })}

                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link to={ROUTES.CATEGORIES}>
          <Button variant="outline">Back to Categories</Button>
        </Link>
        <Link to={`/tests/${attempt.testId}`}>
          <Button>Try Again</Button>
        </Link>
      </div>
    </div>
  )
}
