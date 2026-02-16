import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RHFInput } from '@/components/ui/form'
import type { Category } from '@/types'

// ============================================================
// Schema
// ============================================================

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long'),
  icon: z.string().max(10, 'Icon too long'),
})

type CategoryFormValues = z.infer<typeof categorySchema>

// ============================================================
// Props
// ============================================================

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CategoryFormValues) => void
  isLoading?: boolean
  category?: Category | null // null = create mode, Category = edit mode
}

// ============================================================
// Component
// ============================================================

export const CategoryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  category,
}: CategoryFormModalProps) => {
  const isEditMode = !!category

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '📚',
    },
    mode: 'onChange',
  })

  // Pre-fill form when editing
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '📚',
      })
    } else {
      reset({
        name: '',
        description: '',
        icon: '📚',
      })
    }
  }, [category, reset])

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data)
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 bg-white overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit}>
          <div className="px-6 py-4 space-y-4">
            <RHFInput name="icon" control={control} label="Icon" placeholder="📚" maxLength={10} />

            <RHFInput
              name="name"
              control={control}
              label="Name"
              placeholder="e.g., AWS, Azure, GCP"
              maxLength={100}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...control.register('description')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-none text-sm"
                placeholder="Brief description of this category..."
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create Category'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
