import { useState } from 'react'
import type { ReactNode } from 'react'
import Lightbox from '../components/Lightbox'
import { projectPhoto } from '../lib/projectPhotos'

/**
 * A captioned photo inside a project post, pulled by filename from
 * src/assets/projects/<folder>/. If the file isn't there yet, the dev server
 * shows a dashed slot naming the path it expects; the built site shows nothing.
 *
 * Photos are never stretched past their own size, and are capped in height so
 * a portrait phone shot doesn't run off the screen. Clicking one enlarges it
 * over the page (see components/Lightbox) rather than opening a new tab.
 */
export default function Figure({ folder, file, caption }: {
  folder: string
  file: string
  caption?: string
}) {
  const src = projectPhoto(folder, file)
  const [zoomed, setZoomed] = useState(false)

  if (!src) {
    if (!import.meta.env.DEV) return null
    return (
      <figure className="my-10">
        <div className="aspect-[16/9] max-w-4xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-4 text-center">
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            src/assets/projects/{folder}/{file}
          </p>
        </div>
        {caption && <figcaption className="mt-3 max-w-[60ch] text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>}
      </figure>
    )
  }

  return (
    <figure className="my-10">
      {/* Enlarges in place, for screenshots too dense to read in the column. */}
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label={caption ? `Enlarge: ${caption}` : 'Enlarge image'}
        className="block max-w-full cursor-zoom-in"
      >
        <img
          src={src}
          alt={caption ?? ''}
          loading="lazy"
          className="block max-w-full max-h-[80vh] border border-zinc-200 dark:border-zinc-800 photo-smooth"
        />
      </button>
      {caption && <figcaption className="mt-3 max-w-[60ch] text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>}
      {zoomed && (
        <Lightbox label={caption ?? 'Enlarged image'} caption={caption} onClose={() => setZoomed(false)}>
          <img src={src} alt={caption ?? ''} className="block max-w-full max-h-(--lightbox-h) w-auto h-auto photo-smooth" />
        </Lightbox>
      )}
    </figure>
  )
}

/** Figures side by side (stacked on a phone) — suits a set of portrait shots. */
export function FigureRow({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={`my-10 grid ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-x-6 gap-y-8 items-start [&>figure]:my-0`}>
      {children}
    </div>
  )
}
