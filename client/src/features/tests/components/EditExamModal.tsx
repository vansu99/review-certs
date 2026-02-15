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
import { ScrollArea } from '@/components/ui/scroll-area'
import { RHFInput, RHFSelect } from '@/components/ui/form'
import { useCategories } from '@/features/categories'
import { testService } from '../services/testService'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { TEST_QUERY_KEYS } from '../hooks'
import type { Test } from '@/types'

const editExamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  categoryId: z.string().min(1, 'Category is required'),
  duration: z.string().min(1, 'Duration is required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  passingScore: z.string().min(1, 'Passing score is required'),
})

type EditExamFormValues = z.infer<typeof editExamSchema>

interface EditExamModalProps {
  isOpen: boolean
  onClose: () => void
  exam: Test | null
}

export const EditExamModal = ({ isOpen, onClose, exam }: EditExamModalProps) => {
  const { data: categories } = useCategories()
  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditExamFormValues>({
    resolver: zodResolver(editExamSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      duration: '60',
      difficulty: 'Beginner',
      passingScore: '70',
    },
  })

  // Reset form when exam changes
  useEffect(() => {
    if (exam) {
      reset({
        title: exam.title,
        description: exam.description || '',
        categoryId: exam.categoryId,
        duration: String(exam.duration),
        difficulty: exam.difficulty || 'Beginner',
        passingScore: String(exam.passingScore || 70),
      })
    }
  }, [exam, reset])

  const onSubmit = async (data: EditExamFormValues) => {
    if (!exam) return

    try {
      await testService.updateTest(exam.id, {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        duration: Number(data.duration),
        difficulty: data.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
        passingScore: Number(data.passingScore),
      })

      toast.success('Exam updated successfully!')
      queryClient.invalidateQueries({ queryKey: [TEST_QUERY_KEYS.tests] })
      queryClient.invalidateQueries({
        queryKey: TEST_QUERY_KEYS.byCategory(data.categoryId),
      })
      onClose()
    } catch (error) {
      toast.error('Failed to update exam')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 bg-white overflow-hidden sm:max-w-xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Edit Exam
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[min(85vh,700px)]">
          <div className="px-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="space-y-4">
                <RHFInput
                  name="title"
                  control={control}
                  label="Exam Title"
                  maxLength={191}
                  placeholder="e.g., AWS Certified Solutions Architect Professional"
                />

                <RHFSelect
                  name="categoryId"
                  control={control}
                  label="Category"
                  placeholder="Select a category"
                  options={
                    categories?.map((cat) => ({
                      label: `${cat.icon} ${cat.name}`,
                      value: cat.id,
                    })) || []
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RHFInput
                    name="duration"
                    control={control}
                    label="Duration (minutes)"
                    type="number"
                    placeholder="60"
                  />

                  <RHFInput
                    name="passingScore"
                    control={control}
                    label="Passing Score (%)"
                    type="number"
                    placeholder="70"
                  />
                </div>

                <RHFSelect
                  name="difficulty"
                  control={control}
                  label="Difficulty"
                  options={[
                    { label: '🟢 Beginner', value: 'Beginner' },
                    { label: '🟡 Intermediate', value: 'Intermediate' },
                    { label: '🔴 Advanced', value: 'Advanced' },
                  ]}
                />

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...control.register('description')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                    placeholder="Provide a brief description of the exam..."
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2 pb-6">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
