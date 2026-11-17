import type { ReactNode } from 'react'
import { projectPhoto } from '../lib/projectPhotos'

/**
 * A captioned photo inside a project post, pulled by filename from
 * src/assets/projects/<folder>/. If the file isn't there yet, the dev server
 * shows a dashed slot naming the path it expects; the built site shows nothing.
 *
 * Photos are never stretched past their own size, and are capped in height so
 * a portrait phone shot doesn't run off the screen.
 */
export default function Figure({ folder, file, caption }: {
  folder: string
  file: string
  caption?: string
}) {
  const src = projectPhoto(folder, file)

  if (!src) {
    if (!import.meta.env.DEV) return null
    return (
      <figure className="my-8">
        <div className="aspect-[16/9] rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-4 text-center">
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
            src/assets/projects/{folder}/{file}
          </p>
        </div>
        {caption && <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center">{caption}</figcaption>}
      </figure>
    )
  }

  return (
    <figure className="my-8">
      {/* Clicking opens the full-size file, for screenshots too dense to read in the column. */}
      <a href={src} target="_blank" rel="noopener noreferrer" className="block cursor-zoom-in">
        <img
          src={src}
          alt={caption ?? ''}
          loading="lazy"
          className="block mx-auto max-w-full max-h-[80vh] rounded-lg border border-zinc-200 dark:border-zinc-800 photo-smooth"
        />
      </a>
      {caption && <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center">{caption}</figcaption>}
    </figure>
  )
}

/** Figures side by side (stacked on a phone) — suits a set of portrait shots. */
export function FigureRow({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={`my-8 grid ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 items-start [&>figure]:my-0`}>
      {children}
    </div>
  )
}
