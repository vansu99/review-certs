import { useEffect, useRef } from 'react'

/**
 * Hook that adds an 'is-visible' class when the element scrolls into view.
 * Uses IntersectionObserver for performance — no scroll listeners.
 *
 * Usage:
 *   const ref = useAnimateOnScroll<HTMLDivElement>()
 *   <div ref={ref} className="animate-on-scroll">...</div>
 */
export function useAnimateOnScroll<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el) // Only animate once
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
