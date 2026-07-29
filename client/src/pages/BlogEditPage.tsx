import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { BlogForm } from '@/features/blogs'
import { useManagedBlogById } from '@/features/blogs'
import { useCreateBlog, useUpdateBlog } from '@/features/blogs'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { CreateBlogPayload } from '@/types'

interface BlogEditPageProps {
  mode: 'create' | 'edit'
}

export const BlogEditPage = ({ mode }: BlogEditPageProps) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: blog, isLoading: isFetching } = useManagedBlogById(
    mode === 'edit' ? (id ?? '') : ''
  )

  const createMutation = useCreateBlog()
  const updateMutation = useUpdateBlog()

  const isLoading = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (data: CreateBlogPayload) => {
    try {
      if (mode === 'edit' && id) {
        await updateMutation.mutateAsync({ id, data })
        toast.success('Blog post updated successfully')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Blog post created successfully')
      }
      navigate('/blog/manage')
    } catch {
      toast.error(mode === 'edit' ? 'Failed to update blog post' : 'Failed to create blog post')
    }
  }

  if (mode === 'edit' && isFetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (mode === 'edit' && !blog) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Blog post not found.</p>
        <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate('/blog/manage')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Management
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate('/blog/manage')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog Management
      </button>

      {/* Form card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <BlogForm
          blog={mode === 'edit' ? blog : null}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => navigate('/blog/manage')}
        />
      </div>
    </div>
  )
}
