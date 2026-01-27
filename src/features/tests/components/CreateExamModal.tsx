import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, PlusCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RHFInput, RHFSelect, RHFFileUpload } from '@/components/ui/form'
import { useCategories } from '@/features/categories'
import { testService } from '../services/testService'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { TEST_QUERY_KEYS } from '../hooks'

const createExamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  duration: z.string().min(1, 'Duration is required'),
  imageFile: z.any().optional(),
  videoFile: z.any().optional(),
})

type CreateExamFormValues = z.infer<typeof createExamSchema>

interface CreateExamModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateExamModal = ({ isOpen, onClose }: CreateExamModalProps) => {
  const { data: categories } = useCategories()
  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateExamFormValues>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      duration: '60',
    },
  })

  const onSubmit = async (data: CreateExamFormValues) => {
    try {
      await testService.createTest({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        duration: Number(data.duration),
        imageFile: data.imageFile,
        videoFile: data.videoFile,
      })

      toast.success('Exam created successfully!')
      queryClient.invalidateQueries({ queryKey: [TEST_QUERY_KEYS.tests] })
      onClose()
      reset()
    } catch (error) {
      toast.error('Failed to create exam')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 bg-white overflow-hidden sm:max-w-xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Create New Exam
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

                <RHFInput
                  name="duration"
                  control={control}
                  label="Duration (minutes)"
                  type="number"
                  placeholder="60"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RHFFileUpload
                    name="imageFile"
                    control={control}
                    label="Thumbnail Image"
                    type="image"
                    accept="image/*"
                    helperText="Recommended size: 1280x720"
                  />
                  <RHFFileUpload
                    name="videoFile"
                    control={control}
                    label="Intro Video"
                    type="video"
                    accept="video/mp4,video/x-m4v,video/*"
                    helperText="Intro video for the exam"
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
                      Creating...
                    </>
                  ) : (
                    'Create Exam'
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
