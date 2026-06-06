import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/utils'

interface ScrollToTopProps {
  threshold?: number // px scrolled before button appears
}

export const ScrollToTop = ({ threshold = 300 }: ScrollToTopProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      onClick={scrollUp}
      aria-label="Scroll to top"
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-10 h-10 rounded-full',
        'bg-white border border-gray-200 shadow-md',
        'text-gray-500',
        'flex items-center justify-center',
        'hover:border-indigo-300 hover:text-indigo-600 hover:shadow-lg active:scale-95',
        'transition-all duration-200',
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  )
}
