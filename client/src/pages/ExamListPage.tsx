import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTestsByCategory } from '@/features/tests'
import { useCategories } from '@/features/categories'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/permissions'
import { useBookmarks, useAddBookmark, useRemoveBookmark } from '@/features/bookmarks'
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
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  Bookmark,
  Users,
  Trophy,
  Upload,
  Plus,
  Pencil,
  Trash2,
  Play,
  FolderOpen,
} from 'lucide-react'

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

  const isBookmarked = (testId: string) => bookmarks.some((b) => b.id === testId)

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
    } catch {
      toast.error('Failed to delete exam')
    } finally {
      setIsDeleting(false)
    }
  }

  const getDifficultyStyle = (difficulty: string) => {
    const d = difficulty?.toLowerCase()
    if (d === 'beginner' || d === 'easy') return 'bg-emerald-100 text-emerald-700'
    if (d === 'intermediate' || d === 'medium') return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-1">
          <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-80 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-56 bg-white rounded-xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-gray-700 font-medium">Failed to load exams</p>
        <p className="text-sm text-gray-400 mt-1">Please try again later</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        to={ROUTES.CATEGORIES}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Categories
      </Link>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="text-2xl">{category?.icon || '📂'}</span>
            {category?.name || 'Exams'}
          </h1>
          {category?.description && (
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
          )}
        </div>

        {hasPermission(Permission.CRUD_EXAMS) && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Exam
            </button>
          </div>
        )}
      </div>

      {/* Exam cards */}
      {tests && tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Card body */}
              <div className="p-5 flex-1">
                {/* Title row with bookmark */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 text-[15px]">
                    {test.title}
                  </h3>
                  <div className="flex items-center shrink-0 -mt-0.5 -mr-1">
                    {hasPermission(Permission.CRUD_EXAMS) && (
                      <>
                        <button
                          onClick={() => setEditingExam(test)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingExam(test)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => handleToggleBookmark(test.id, e)}
                      disabled={addBookmark.isPending || removeBookmark.isPending}
                      className={`p-1.5 rounded-md transition-colors ${
                        isBookmarked(test.id)
                          ? 'text-indigo-600'
                          : 'text-gray-400 hover:text-indigo-600'
                      } disabled:opacity-50`}
                    >
                      <Bookmark
                        className="w-4 h-4"
                        fill={isBookmarked(test.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {test.description && (
                  <p className="text-[13px] text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {test.description}
                  </p>
                )}

                {/* Stats grid — 2x2 */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] mb-4">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    <span>{test.questionCount} questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{test.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{test.participants.toLocaleString()} taken</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Trophy className="w-3.5 h-3.5 text-gray-400" />
                    <span>Pass: {test.passingScore}%</span>
                  </div>
                </div>

                {/* Difficulty badge */}
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${getDifficultyStyle(test.difficulty)}`}
                >
                  {test.difficulty}
                </span>
              </div>

              {/* Card footer — CTA */}
              <div className="px-5 pb-5">
                <Link
                  to={`/test/${test.id}/exam`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Start Exam
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No exams yet</p>
          <p className="text-sm text-gray-400 mt-1">Come back soon for new exams</p>
        </div>
      )}

      {/* Modals */}
      <ImportExamModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        categoryId={categoryId}
      />
      <CreateExamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categoryId={categoryId}
      />
      <EditExamModal
        isOpen={!!editingExam}
        onClose={() => setEditingExam(null)}
        exam={editingExam}
      />

      {/* Delete dialog */}
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
