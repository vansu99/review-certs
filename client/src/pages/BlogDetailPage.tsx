import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Eye, Clock, Loader2, BookOpen, Heart } from 'lucide-react'
import { useBlogBySlug } from '@/features/blogs'
import { LikeButton, RichTextEditor } from '@/features/blogs'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'

import { ScrollToTop } from '@/components/common'

export const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const { data: blog, isLoading, error } = useBlogBySlug(slug ?? '')

  // Show title in sticky bar only after scrolling past the h1
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showStickyTitle, setShowStickyTitle] = useState(false)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyTitle(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-56px 0px 0px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [blog])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Article not found</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          This article may have been removed or is no longer available.
        </p>
        <Link to="/blog">
          <Button variant="outline" size="sm" className="gap-2 mt-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Sticky top nav ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          {/* Back */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Blog</span>
          </Link>

          {/* Title fades in after h1 scrolls out of view */}
          <p
            className={`flex-1 text-sm font-semibold text-gray-800 truncate text-center transition-all duration-300 ${
              showStickyTitle
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            {blog.title}
          </p>

          {/* Like */}
          <div className="shrink-0">
            <LikeButton blogId={blog.id} initialLikeCount={blog.likeCount} size="sm" />
          </div>
        </div>
      </div>

      {/* ── Article ── */}
      <article className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Date range pill */}
        {(blog.startDate || blog.endDate) && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 mb-5">
            <Calendar className="w-3 h-3" />
            {blog.startDate && format(new Date(blog.startDate), 'MMM d')}
            {blog.startDate && blog.endDate && ' – '}
            {blog.endDate && format(new Date(blog.endDate), 'MMM d, yyyy')}
          </div>
        )}

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-3xl sm:text-[2.25rem] font-bold text-gray-950 leading-[1.2] tracking-tight mb-6"
        >
          {blog.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 select-none">
            {blog.author?.name?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-none mb-1">
              {blog.author?.name ?? 'Anonymous'}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(blog.createdAt), 'MMM d, yyyy')}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {blog.viewCount.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-8" />

        {/* Body */}
        <div className="text-gray-700 leading-relaxed">
          {blog.description ? (
            <RichTextEditor value={blog.description} readOnly />
          ) : (
            <p className="text-gray-400 italic text-sm">No content available.</p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="mt-14 pt-8 border-t border-gray-100 space-y-6">
          {/* Like CTA */}
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Found this helpful?</p>
                <p className="text-xs text-gray-400 mt-0.5">Leave a like to let the author know.</p>
              </div>
            </div>
            <LikeButton blogId={blog.id} initialLikeCount={blog.likeCount} size="md" />
          </div>

          {/* Back link */}
          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to all articles
            </Link>
          </div>
        </div>
      </article>
      <ScrollToTop />
    </div>
  )
}
