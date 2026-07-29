import { useEffect } from 'react'

interface PageMetaProps {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
  noindex?: boolean
}

/**
 * Lightweight SEO component that sets document title and meta tags.
 * No external dependency (no react-helmet needed).
 */
export const PageMeta = ({
  title,
  description,
  canonical,
  ogImage,
  noindex = false,
}: PageMetaProps) => {
  useEffect(() => {
    // Title
    document.title = title

    // Meta description
    setMeta('description', description)

    // Open Graph
    setMeta('og:title', title, 'property')
    setMeta('og:description', description, 'property')
    if (ogImage) setMeta('og:image', ogImage, 'property')
    setMeta('og:type', 'website', 'property')

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    if (ogImage) setMeta('twitter:image', ogImage)

    // Canonical
    let linkEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) {
      if (!linkEl) {
        linkEl = document.createElement('link')
        linkEl.setAttribute('rel', 'canonical')
        document.head.appendChild(linkEl)
      }
      linkEl.setAttribute('href', canonical)
    } else if (linkEl) {
      linkEl.remove()
    }

    // Robots
    if (noindex) {
      setMeta('robots', 'noindex, nofollow')
    } else {
      removeMeta('robots')
    }

    return () => {
      // Cleanup canonical on unmount
      const el = document.querySelector('link[rel="canonical"]')
      if (el) el.remove()
    }
  }, [title, description, canonical, ogImage, noindex])

  return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setMeta(name: string, content: string | undefined, attr: 'name' | 'property' = 'name') {
  if (!content) return

  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMeta(name: string, attr: 'name' | 'property' = 'name') {
  const el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (el) el.remove()
}
