import { useState } from 'react'
import type { ReactNode } from 'react'
import Lightbox from '../components/Lightbox'

/**
 * A chart inside a project post: an SVG's markup, inlined rather than loaded
 * through <img> so the page's theme reaches it. The HAILIB autotune charts
 * color everything through CSS variables (--grid, --ink, --s1 ...) with
 * light-mode fallbacks, so the wrapper only has to supply dark-mode values.
 */
export default function Chart({ svg, caption }: { svg: string; caption?: string }) {
  return (
    <VectorFigure caption={caption}>
      <div
        className="[&_svg]:min-w-[560px]
          dark:[--surface:#1c1c1f] dark:[--grid:#2e2e33] dark:[--axis:#6b6b74] dark:[--muted:#a1a1aa]
          dark:[--ink:#f4f4f5] dark:[--ink-2:#d4d4d8] dark:[--band:#26262b] dark:[--band-strong:#2f3542]
          dark:[--s1:#5b9cf0] dark:[--s6:#3fb950]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </VectorFigure>
  )
}

/**
 * A chart or diagram drawn as inline SVG. On a phone it keeps a readable
 * minimum width and scrolls sideways in its own box; clicking it enlarges the
 * same vector (still sharp, still themed) to fill the screen.
 */
export function VectorFigure({ caption, children }: { caption?: string; children: ReactNode }) {
  const [zoomed, setZoomed] = useState(false)
  return (
    <figure className="my-10">
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label={caption ? `Enlarge: ${caption}` : 'Enlarge figure'}
        className="block w-full max-w-5xl overflow-x-auto text-left cursor-zoom-in border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 [&_svg]:block [&_svg]:w-full [&_svg]:h-auto"
      >
        {children}
      </button>
      {caption && <figcaption className="mt-3 max-w-[60ch] text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>}
      {zoomed && (
        <Lightbox label={caption ?? 'Enlarged figure'} caption={caption} onClose={() => setZoomed(false)}>
          {/* Fit the screen: full width, capped by the height budget (the SVG letterboxes inside). */}
          <div className="w-[min(95vw,100rem)] bg-white dark:bg-zinc-900 p-3 sm:p-5 [&_svg]:block [&_svg]:w-full [&_svg]:h-auto [&_svg]:min-w-0! [&_svg]:max-h-[calc(var(--lightbox-h)-2.5rem)]">
            {children}
          </div>
        </Lightbox>
      )}
    </figure>
  )
}
