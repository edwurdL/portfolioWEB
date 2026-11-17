/**
 * A chart inside a project post: an SVG's markup, inlined rather than loaded
 * through <img> so the page's theme reaches it. The HAILIB autotune charts
 * colour everything through CSS variables (--grid, --ink, --s1 ...) with
 * light-mode fallbacks, so the wrapper only has to supply dark-mode values.
 * On a phone the chart keeps a readable minimum width and scrolls sideways
 * inside its own box rather than shrinking its text to nothing.
 */
export default function Chart({ svg, caption }: { svg: string; caption?: string }) {
  return (
    <figure className="my-8">
      <div
        className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800
          [&_svg]:block [&_svg]:w-full [&_svg]:h-auto [&_svg]:min-w-[560px]
          dark:[--surface:#1c1c1f] dark:[--grid:#2e2e33] dark:[--axis:#6b6b74] dark:[--muted:#a1a1aa]
          dark:[--ink:#f4f4f5] dark:[--ink-2:#d4d4d8] dark:[--band:#26262b] dark:[--band-strong:#2f3542]
          dark:[--s1:#5b9cf0] dark:[--s6:#3fb950]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption && <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center">{caption}</figcaption>}
    </figure>
  )
}
