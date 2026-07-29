import { useState } from 'react'
import { Search, BookOpen, Loader2, Rss } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { BlogCard } from '@/features/blogs'
import { usePublishedBlogs } from '@/features/blogs'
import { Button } from '@/components/ui/button'
import { useDebounce } from 'react-use'

import { ScrollToTop } from '@/components/common'

export const BlogListPage = () => {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useDebounce(
    () => {
      setDebouncedSearch(search)
      setPage(1)
    },
    400,
    [search]
  )

  const { data, isLoading, error } = usePublishedBlogs({
    search: debouncedSearch,
    page,
    pageSize: 9,
  })

  const blogs = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <Rss className="w-4 h-4" />
            Blog
          </div>
          <h1 className="text-4xl font-bold mb-4">Insights & Updates</h1>
          <p className="text-indigo-200 text-lg max-w-xl mx-auto">
            Tips, guides, and news to help you prepare for your certifications.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-indigo-300 focus:bg-white/20 focus:border-white/40"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-red-500">Failed to load blog posts. Please try again.</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-400 text-sm">
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : 'Check back soon for new content.'}
            </p>
          </div>
        ) : (
          <>
            {debouncedSearch && (
              <p className="text-sm text-gray-500 mb-6">
                {data?.total} result{data?.total !== 1 ? 's' : ''} for &ldquo;{debouncedSearch}
                &rdquo;
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        p === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <ScrollToTop />
    </div>
  )
}
