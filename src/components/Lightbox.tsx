import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * An enlarged view of one image over the page, instead of opening the file in
 * a new tab. Clicking anywhere, pressing Escape, or the close button dismisses
 * it; the page behind doesn't scroll while it's open. Fades and scales in and
 * out like the site's other popups.
 */
export default function Lightbox({ src, alt, caption, onClose }: {
  src: string
  alt: string
  caption?: string
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  useEffect(() => {
    const returnFocus = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => setVisible(true))
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      returnFocus?.focus()
    }
  }, [])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption ?? alt ?? 'Enlarged image'}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 sm:p-10 cursor-zoom-out"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 250ms ease' }}
      onClick={close}
    >
      {/* Shown at its own size or smaller, never stretched; the height cap leaves
          room for the caption. */}
      <img
        src={src}
        alt={alt}
        className={`block max-w-full w-auto h-auto rounded-lg shadow-2xl photo-smooth ${
          caption ? 'max-h-[calc(100dvh-7rem)]' : 'max-h-[calc(100dvh-3rem)]'
        }`}
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.96)',
          transition: 'transform 250ms ease',
        }}
      />
      {caption && <p className="max-w-2xl text-center text-sm text-white/80">{caption}</p>}
      <button
        ref={closeRef}
        type="button"
        onClick={close}
        aria-label="Close enlarged image"
        className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>,
    document.body,
  )
}
