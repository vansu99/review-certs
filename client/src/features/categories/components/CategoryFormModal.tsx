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
import { RHFInput, RHFSelect } from '@/components/ui/form'
import type { Category } from '@/types'

// ============================================================
// Schema
// ============================================================

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  provider: z.string().max(100, 'Provider too long').optional(),
  certificationCode: z.string().max(50, 'Code too long').optional(),
  level: z.enum(['Foundation', 'Associate', 'Professional', 'Specialty']),
  version: z.string().max(50, 'Version too long').optional(),
  status: z.enum(['draft', 'published', 'archived']),
  displayOrder: z.coerce.number().int().min(0, 'Display order cannot be negative'),
  defaultPassingScore: z.coerce
    .number()
    .int()
    .min(1, 'Passing score must be at least 1')
    .max(100, 'Passing score cannot exceed 100'),
  estimatedHours: z.coerce.number().int().min(0, 'Estimated hours cannot be negative'),
  description: z.string().max(500, 'Description too long'),
  icon: z.string().max(10, 'Icon too long'),
})

type CategoryFormInput = z.input<typeof categorySchema>
type CategoryFormValues = z.output<typeof categorySchema>

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
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      provider: '',
      certificationCode: '',
      level: 'Foundation',
      version: '',
      status: 'draft',
      displayOrder: 0,
      defaultPassingScore: 70,
      estimatedHours: 0,
      description: '',
      icon: 'CERT',
    },
    mode: 'onChange',
  })

  // Pre-fill form when editing
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        provider: category.provider || '',
        certificationCode: category.certificationCode || '',
        level: category.level || 'Foundation',
        version: category.version || '',
        status: category.status || 'draft',
        displayOrder: category.displayOrder || 0,
        defaultPassingScore: category.defaultPassingScore || 70,
        estimatedHours: category.estimatedHours || 0,
        description: category.description || '',
        icon: category.icon || 'CERT',
      })
    } else {
      reset({
        name: '',
        provider: '',
        certificationCode: '',
        level: 'Foundation',
        version: '',
        status: 'draft',
        displayOrder: 0,
        defaultPassingScore: 70,
        estimatedHours: 0,
        description: '',
        icon: 'CERT',
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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 bg-white overflow-y-auto">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Certification Track' : 'Create Certification Track'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit}>
          <div className="px-6 py-4 space-y-4">
            <RHFInput
              name="icon"
              control={control}
              label="Icon"
              placeholder="CERT"
              maxLength={10}
            />

            <RHFInput
              name="name"
              control={control}
              label="Name"
              placeholder="e.g., AWS Solutions Architect"
              maxLength={100}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RHFInput
                name="provider"
                control={control}
                label="Provider"
                placeholder="AWS, Microsoft, Google"
                maxLength={100}
              />

              <RHFInput
                name="certificationCode"
                control={control}
                label="Certification Code"
                placeholder="SAA-C03"
                maxLength={50}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RHFSelect
                name="level"
                control={control}
                label="Level"
                options={[
                  { label: 'Foundation', value: 'Foundation' },
                  { label: 'Associate', value: 'Associate' },
                  { label: 'Professional', value: 'Professional' },
                  { label: 'Specialty', value: 'Specialty' },
                ]}
              />

              <RHFSelect
                name="status"
                control={control}
                label="Status"
                options={[
                  { label: 'Draft', value: 'draft' },
                  { label: 'Published', value: 'published' },
                  { label: 'Archived', value: 'archived' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RHFInput name="version" control={control} label="Version" placeholder="2026" />
              <RHFInput
                name="displayOrder"
                control={control}
                label="Display Order"
                type="number"
                min={0}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RHFInput
                name="defaultPassingScore"
                control={control}
                label="Passing Score"
                type="number"
                min={1}
                max={100}
              />
              <RHFInput
                name="estimatedHours"
                control={control}
                label="Estimated Hours"
                type="number"
                min={0}
              />
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                {...register('description')}
                id="category-description"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-none text-sm"
                placeholder="What this certification track covers..."
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
                  {isEditMode ? 'Saving…' : 'Creating…'}
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create Track'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
