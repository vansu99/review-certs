import {
  useForm,
  useController,
  useWatch,
  type Control,
  type FieldValues,
  type FieldPath,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateGoal } from '@/features/goals'
import { useCategories } from '@/features/categories'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RHFInput, RHFSelect, RHFRadio, RHFDatepicker } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'

interface RHFTextAreaProps<
  T extends FieldValues,
> extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  helperText?: string
}

function RHFTextArea<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  className = '',
  ...props
}: RHFTextAreaProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control })

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        {...field}
        id={name}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  )
}

const createGoalSchema = z
  .object({
    name: z.string().min(1, 'Goal Name is required'),
    description: z.string().optional(),
    targetType: z.enum(['category', 'exams'] as const),
    categoryId: z.string().optional(),
    examIds: z.array(z.string()).default([]),
    passingScore: z.string(),
    startDate: z.string().min(1, 'Start Date is required'),
    endDate: z.string().min(1, 'End Date is required'),
    priority: z.enum(['low', 'medium', 'high'] as const),
  })
  .refine(
    (data) => {
      if (data.targetType === 'category' && !data.categoryId) {
        return false
      }
      return true
    },
    {
      message: 'Category is required',
      path: ['categoryId'],
    }
  )
  .refine(
    (data) => {
      if (data.endDate && data.startDate && data.endDate < data.startDate) {
        return false
      }
      return true
    },
    {
      message: 'End date cannot be before start date',
      path: ['endDate'],
    }
  )

type CreateGoalFormValues = z.infer<typeof createGoalSchema>

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateGoalModal = ({ isOpen, onClose }: CreateGoalModalProps) => {
  const { mutate: createGoal, isPending } = useCreateGoal()
  const { data: categories } = useCategories()

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      name: '',
      description: '',
      targetType: 'category',
      categoryId: '',
      examIds: [],
      passingScore: '70',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      priority: 'medium',
    },
  })

  // Watch for validation or conditional rendering
  const targetType = useWatch({ control, name: 'targetType' })
  const startDate = useWatch({ control, name: 'startDate' })

  const onSubmit = (data: CreateGoalFormValues) => {
    createGoal(
      {
        name: data.name,
        description: data.description || undefined,
        targetType: data.targetType,
        categoryId: data.categoryId || undefined,
        examIds: data.examIds,
        passingScore: Number(data.passingScore),
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority,
      },
      {
        onSuccess: () => {
          onClose()
          reset()
        },
      }
    )
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-0 bg-white overflow-hidden sm:max-w-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Create New Goal
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[min(80vh,600px)]">
          <div className="px-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
              <RHFInput
                name="name"
                control={control}
                label="Goal Name *"
                maxLength={191}
                placeholder="e.g., Master AWS Solutions Architect"
              />

              <RHFTextArea
                name="description"
                control={control}
                label="Description"
                maxLength={500}
                placeholder="Describe your goal..."
                rows={2}
              />

              <RHFRadio
                name="targetType"
                control={control}
                label="Target Type *"
                direction="horizontal"
                options={[
                  { label: 'Category', value: 'category' },
                  { label: 'Specific Exams', value: 'exams' },
                ]}
              />

              {targetType === 'category' && (
                <RHFSelect
                  name="categoryId"
                  control={control}
                  label="Select Category *"
                  placeholder="Choose a category..."
                  options={
                    categories?.map((cat) => ({
                      label: `${cat.icon} ${cat.name}`,
                      value: cat.id,
                    })) || []
                  }
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <RHFSelect
                  name="passingScore"
                  control={control}
                  label="Passing Score *"
                  options={[
                    { label: '60%', value: 60 },
                    { label: '70%', value: 70 },
                    { label: '80%', value: 80 },
                    { label: '90%', value: 90 },
                  ]}
                />
                <RHFSelect
                  name="priority"
                  control={control}
                  label="Priority"
                  options={[
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <RHFDatepicker name="startDate" control={control} label="Start Date *" />
                <RHFDatepicker
                  name="endDate"
                  control={control}
                  label="End Date *"
                  minDate={startDate}
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">🏆 Award Tiers</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-yellow-700">
                  <span>Bronze: Avg score 60-79%</span>
                  <span>Silver: Avg score 80-89%</span>
                  <span>Gold: Avg score 90-94%</span>
                  <span>Diamond: Avg score ≥95%</span>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2 pb-6 px-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Goal'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
