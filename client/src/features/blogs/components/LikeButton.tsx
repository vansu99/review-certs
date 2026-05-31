import { useState, useCallback, useRef } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/utils'
import { useToggleBlogLike } from '../hooks/useBlogMutations'
import { useBlogLikeStatus } from '../hooks/useBlogs'

interface LikeButtonProps {
  blogId: string
  initialLikeCount: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

const DEBOUNCE_MS = 800 // Prevent spam: min 800ms between clicks

export const LikeButton = ({
  blogId,
  initialLikeCount,
  size = 'md',
  showCount = true,
  className,
}: LikeButtonProps) => {
  const { data: likeStatus } = useBlogLikeStatus(blogId)
  const toggleMutation = useToggleBlogLike(blogId)

  // Optimistic local state
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null)
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Anti-spam: debounce ref
  const lastClickRef = useRef<number>(0)
  const pendingRef = useRef<boolean>(false)

  const liked = optimisticLiked ?? likeStatus?.liked ?? false
  const likeCount = optimisticCount ?? initialLikeCount

  const handleClick = useCallback(async () => {
    const now = Date.now()

    // Anti-spam: ignore if clicked too recently or already pending
    if (pendingRef.current || now - lastClickRef.current < DEBOUNCE_MS) {
      // Pulse animation to indicate the click was registered but debounced
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)
      return
    }

    lastClickRef.current = now
    pendingRef.current = true

    // Optimistic update
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1)
    setOptimisticLiked(newLiked)
    setOptimisticCount(newCount)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 400)

    try {
      const result = await toggleMutation.mutateAsync()
      // Sync with server response
      setOptimisticLiked(result.liked)
      setOptimisticCount(result.likeCount)
    } catch {
      // Revert on error
      setOptimisticLiked(liked)
      setOptimisticCount(likeCount)
    } finally {
      pendingRef.current = false
    }
  }, [liked, likeCount, toggleMutation])

  const sizeClasses = {
    sm: 'gap-1 px-2 py-1 text-xs',
    md: 'gap-1.5 px-3 py-1.5 text-sm',
    lg: 'gap-2 px-4 py-2 text-base',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all duration-200 select-none',
        sizeClasses[size],
        liked
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700',
        isAnimating && 'scale-110',
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-all duration-200',
          liked ? 'fill-red-500 text-red-500' : 'fill-none',
          isAnimating && liked && 'scale-125'
        )}
      />
      {showCount && <span>{likeCount}</span>}
    </button>
  )
}
