import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCategories, CategoryList, CategoryFormModal } from '@/features/categories'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/categories/hooks/useCategoryMutations'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import type { Category } from '@/types'
import type { CategoryPayload } from '@/features/categories/services/categoryService'

export const CategoryListPage = () => {
  const { data: categories, isLoading, error } = useCategories()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(Permission.CRUD_CATEGORIES)

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  // Mutations
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  // Handlers
  const handleCreate = () => {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleDelete = (category: Category) => {
    setDeletingCategory(category)
  }

  const handleFormSubmit = async (data: CategoryPayload) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, data })
        toast.success('Category updated successfully')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Category created successfully')
      }
      setIsFormOpen(false)
      setEditingCategory(null)
    } catch {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return
    try {
      await deleteMutation.mutateAsync(deletingCategory.id)
      toast.success(`"${deletingCategory.name}" archived successfully`)
      setDeletingCategory(null)
    } catch {
      toast.error('Failed to archive category')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load categories. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certification Tracks</h1>
          <p className="text-gray-600 mt-1">
            Choose a track to practice toward a certification goal
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
            <Plus className="w-4 h-4" />
            Create Track
          </Button>
        )}
      </div>

      <CategoryList
        categories={categories || []}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create / Edit Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingCategory(null)
        }}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        category={editingCategory}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Certification Track</AlertDialogTitle>
            <AlertDialogDescription>
              Archive{' '}
              <span className="font-semibold text-gray-900">"{deletingCategory?.name}"</span>? The
              track will be hidden from learners, but its tests, history, goals, and analytics stay
              intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Archiving…' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
