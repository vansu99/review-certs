import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RichTextEditor } from './RichTextEditor'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { FileText, Search, Calendar, Loader2 } from 'lucide-react'
import type { Blog, BlogStatus } from '@/types'

const blogSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(300, 'Title too long'),
    description: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    meta_title: z.string().max(300, 'Meta title too long').optional().nullable(),
    meta_description: z.string().max(500, 'Meta description too long').optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) <= new Date(data.end_date)
      }
      return true
    },
    { message: 'End date must be after start date', path: ['end_date'] }
  )

type BlogFormValues = z.infer<typeof blogSchema>

interface BlogFormProps {
  blog?: Blog | null
  onSubmit: (data: BlogFormValues) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

const STATUS_OPTIONS: { value: BlogStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-700' },
  { value: 'archived', label: 'Archived', color: 'bg-orange-100 text-orange-700' },
]

export const BlogForm = ({ blog, onSubmit, isLoading, onCancel }: BlogFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title ?? '',
      description: blog?.description ?? '',
      status: blog?.status ?? 'draft',
      start_date: blog?.startDate ? blog.startDate.slice(0, 10) : null,
      end_date: blog?.endDate ? blog.endDate.slice(0, 10) : null,
      meta_title: blog?.metaTitle ?? '',
      meta_description: blog?.metaDescription ?? '',
    },
  })

  const titleValue = watch('title')
  const statusValue = watch('status')
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === statusValue)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {blog ? 'Edit Blog Post' : 'Create Blog Post'}
          </h2>
          <p className="text-sm text-gray-500">
            {blog ? 'Update your blog post details' : 'Fill in the details for your new blog post'}
          </p>
        </div>
        {currentStatus && (
          <Badge className={`ml-auto ${currentStatus.color} border-0`}>
            {currentStatus.label}
          </Badge>
        )}
      </div>

      <Separator />

      <div className="space-y-6">
        {/* Title + Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter blog title..."
              {...register('title')}
              className={errors.title ? 'border-red-400' : ''}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            {titleValue && (
              <p className="text-xs text-gray-400">
                Slug:{' '}
                <span className="font-mono text-indigo-600">
                  {titleValue.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60)}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>
              Status <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            opt.value === 'published' ? 'bg-green-500'
                            : opt.value === 'draft' ? 'bg-gray-400'
                            : 'bg-orange-400'
                          }`} />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Content — paste markdown directly, auto-converts */}
        <div className="space-y-1.5">
          <Label>Content</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="Write or paste content here — Markdown is auto-converted on paste"
              />
            )}
          />
        </div>

        {/* Date range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="start_date" className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Start Date
            </Label>
            <Input id="start_date" type="date" {...register('start_date')} />
            <p className="text-xs text-gray-400">Visible from this date (optional)</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end_date" className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              End Date
            </Label>
            <Input id="end_date" type="date" {...register('end_date')} />
            {errors.end_date && <p className="text-xs text-red-500">{errors.end_date.message}</p>}
            <p className="text-xs text-gray-400">Hidden after this date (optional)</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* SEO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">SEO Settings</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              placeholder="SEO title (defaults to blog title if empty)"
              {...register('meta_title')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              placeholder="Brief description for search engines (150–160 characters recommended)"
              rows={3}
              {...register('meta_description')}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
          ) : blog ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  )
}
