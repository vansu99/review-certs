import { Link } from 'react-router-dom'
import { Heart, Eye, Calendar, User, ArrowRight, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { format } from 'date-fns'
import type { BlogListItem } from '@/types'
import { cn } from '@/utils'

interface BlogCardProps {
  blog: BlogListItem
  className?: string
}

export const BlogCard = ({ blog, className }: BlogCardProps) => {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className={cn(
        'group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm',
        'hover:shadow-md hover:border-indigo-100 transition-all duration-200',
        className
      )}
    >
      {/* Color accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl" />

      <div className="flex flex-col flex-1 p-5">
        {/* Author + date */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold shrink-0">
            {blog.author?.name?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <span className="text-xs text-gray-500 font-medium truncate">
            {blog.author?.name ?? 'Anonymous'}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400 shrink-0">
            {format(new Date(blog.createdAt), 'MMM d, yyyy')}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {blog.title}
        </h3>

        {/* Meta description */}
        {blog.metaDescription && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{blog.metaDescription}</p>
        )}

        {/* Date range badge */}
        {(blog.startDate || blog.endDate) && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
            <Calendar className="w-3 h-3" />
            <span>
              {blog.startDate && format(new Date(blog.startDate), 'MMM d')}
              {blog.startDate && blog.endDate && ' – '}
              {blog.endDate && format(new Date(blog.endDate), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Heart className="w-3.5 h-3.5" />
              {blog.likeCount}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="w-3.5 h-3.5" />
              {blog.viewCount}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-indigo-500 font-medium group-hover:gap-2 transition-all">
            Read more
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Management row variant ───────────────────────────────────────────────────

interface BlogManageRowProps {
  blog: BlogListItem
  onEdit: (blog: BlogListItem) => void
  onDelete: (blog: BlogListItem) => void
}

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-50 text-green-700 border-green-200',
  draft: 'bg-gray-50 text-gray-600 border-gray-200',
  archived: 'bg-orange-50 text-orange-700 border-orange-200',
}

export const BlogManageRow = ({ blog, onEdit, onDelete }: BlogManageRowProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
      {/* Status dot */}
      <div
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          blog.status === 'published'
            ? 'bg-green-500'
            : blog.status === 'draft'
              ? 'bg-gray-400'
              : 'bg-orange-400'
        )}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{blog.title}</h3>
          <Badge
            variant="outline"
            className={cn('text-xs capitalize shrink-0', STATUS_STYLES[blog.status])}
          >
            {blog.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <User className="w-3 h-3" />
            {blog.author?.name}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {format(new Date(blog.createdAt), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Heart className="w-3 h-3" />
            {blog.likeCount}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="w-3 h-3" />
            {blog.viewCount}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={`/blog/${blog.slug}`}
                target="_blank"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">Preview</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onEdit(blog)}
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDelete(blog)}
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
