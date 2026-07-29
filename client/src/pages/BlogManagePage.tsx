import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Loader2, BookOpen, Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { BlogManageRow } from '@/features/blogs'
import { useManagedBlogs } from '@/features/blogs'
import { useDeleteBlog } from '@/features/blogs'
import { toast } from 'sonner'
import { useDebounce } from 'react-use'
import type { BlogListItem, BlogStatus } from '@/types'

export const BlogManagePage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BlogStatus | ''>('')
  const [page, setPage] = useState(1)
  const [deletingBlog, setDeletingBlog] = useState<BlogListItem | null>(null)

  useDebounce(
    () => {
      setDebouncedSearch(search)
      setPage(1)
    },
    400,
    [search]
  )

  const { data, isLoading, error } = useManagedBlogs({
    search: debouncedSearch,
    status: statusFilter,
    page,
    pageSize: 10,
  })

  const deleteMutation = useDeleteBlog()

  const blogs = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handleEdit = (blog: BlogListItem) => {
    navigate(`/blog/manage/${blog.id}/edit`)
  }

  const handleDelete = (blog: BlogListItem) => {
    setDeletingBlog(blog)
  }

  const handleConfirmDelete = async () => {
    if (!deletingBlog) return
    try {
      await deleteMutation.mutateAsync(deletingBlog.id)
      toast.success(`"${deletingBlog.title}" deleted successfully`)
      setDeletingBlog(null)
    } catch {
      toast.error('Failed to delete blog post')
    }
  }

  // Stats
  const publishedCount = blogs.filter((b) => b.status === 'published').length
  const draftCount = blogs.filter((b) => b.status === 'draft').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rss className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          </div>
          <p className="text-gray-500 text-sm">Create and manage your blog posts</p>
        </div>
        <Button
          onClick={() => navigate('/blog/manage/new')}
          className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Posts', value: total, color: 'text-gray-900' },
          { label: 'Published', value: publishedCount, color: 'text-green-600' },
          { label: 'Drafts', value: draftCount, color: 'text-gray-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select
            value={statusFilter || 'all'}
            onValueChange={(v) => {
              setStatusFilter(v === 'all' ? '' : (v as BlogStatus))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 text-sm">Failed to load blog posts.</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-600 mb-2">No posts yet</h3>
          <p className="text-gray-400 text-sm mb-6">
            {debouncedSearch || statusFilter
              ? 'No posts match your filters.'
              : 'Create your first blog post to get started.'}
          </p>
          {!debouncedSearch && !statusFilter && (
            <Button
              onClick={() => navigate('/blog/manage/new')}
              className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create First Post
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {blogs.map((blog) => (
            <BlogManageRow key={blog.id} blog={blog} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingBlog} onOpenChange={(open) => !open && setDeletingBlog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">"{deletingBlog?.title}"</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
