import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTestsByCategory } from '@/features/tests'
import { useCategories } from '@/features/categories'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/permissions'
import { useBookmarks, useAddBookmark, useRemoveBookmark } from '@/features/bookmarks'
import {
  ChevronLeftIcon,
  ClockIcon,
  DocumentTextIcon,
  BookmarkIcon,
  SignalIcon,
  UsersIcon,
  CheckBadgeIcon,
  ArrowUpTrayIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { ROUTES } from '@/constants'
import { ImportExamModal, CreateExamModal, EditExamModal } from '@/features/tests'
import { testService } from '@/features/tests/services/testService'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Test } from '@/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const ExamListPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { data: tests, isLoading, error } = useTestsByCategory(categoryId || '')
  const { data: categories } = useCategories()
  const { hasPermission } = usePermissions()
  const { data: bookmarks = [] } = useBookmarks()
  const addBookmark = useAddBookmark()
  const removeBookmark = useRemoveBookmark()
  const queryClient = useQueryClient()

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Test | null>(null)
  const [deletingExam, setDeletingExam] = useState<Test | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const category = categories?.find((c) => c.id === categoryId)

  // Check if a test is bookmarked
  const isBookmarked = (testId: string) => {
    return bookmarks.some((b) => b.id === testId)
  }

  // Toggle bookmark
  const handleToggleBookmark = async (testId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (isBookmarked(testId)) {
        await removeBookmark.mutateAsync(testId)
      } else {
        await addBookmark.mutateAsync(testId)
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    }
  }

  // Delete exam
  const handleDeleteExam = async () => {
    if (!deletingExam) return

    setIsDeleting(true)
    try {
      await testService.deleteTest(deletingExam.id)
      toast.success('Exam deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      if (categoryId) {
        queryClient.invalidateQueries({ queryKey: ['tests', 'category', categoryId] })
      }
      setDeletingExam(null)
    } catch (err) {
      toast.error('Failed to delete exam')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load exams. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back link and header */}
      <div>
        <Link
          to={ROUTES.CATEGORIES}
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to Categories
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category?.name || 'Exams'}</h1>
            <p className="text-gray-600 mt-1">
              {category?.description || 'Choose an exam to start'}
            </p>
          </div>
          {hasPermission(Permission.CRUD_EXAMS) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-indigo-200 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Import Exam
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Exam
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exam list */}
      <div className="space-y-4">
        {tests && tests.length > 0 ? (
          tests.map((test) => (
            <Link
              key={test.id}
              to={`/test/${test.id}/exam`}
              className="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{test.questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4" />
                      <span>{test.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <SignalIcon className="w-4 h-4" />
                      <span>{test.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-4 h-4" />
                      <span>{test.participants.toLocaleString()} participants</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckBadgeIcon className="w-4 h-4" />
                      <span>Passing: {test.passingScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-1">
                    {hasPermission(Permission.CRUD_EXAMS) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditingExam(test)
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit exam"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDeletingExam(test)
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete exam"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => handleToggleBookmark(test.id, e)}
                      disabled={addBookmark.isPending || removeBookmark.isPending}
                      className={`p-2 rounded-lg transition-colors ${
                        isBookmarked(test.id)
                          ? 'text-indigo-600 hover:bg-indigo-50'
                          : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                      } disabled:opacity-50`}
                      title={isBookmarked(test.id) ? 'Remove bookmark' : 'Bookmark exam'}
                    >
                      {isBookmarked(test.id) ? (
                        <BookmarkSolidIcon className="w-6 h-6" />
                      ) : (
                        <BookmarkIcon className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                  <span className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Start Challenge
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No exams available in this category.</p>
          </div>
        )}
      </div>

      {/* Import Exam Modal */}
      <ImportExamModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        categoryId={categoryId}
      />

      {/* Create Exam Modal */}
      <CreateExamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categoryId={categoryId}
      />

      {/* Edit Exam Modal */}
      <EditExamModal
        isOpen={!!editingExam}
        onClose={() => setEditingExam(null)}
        exam={editingExam}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingExam} onOpenChange={(open) => !open && setDeletingExam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{deletingExam?.title}"</strong>? This will
              also delete all questions and attempt history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteExam}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
