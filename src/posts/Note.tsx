import type { ReactNode } from 'react'

/** A ruled aside at the top of a post: what to know before reading the rest. */
export default function Note({ children }: { children: ReactNode }) {
  return (
    <div role="note" className="mb-10 border-b border-zinc-300 dark:border-zinc-700 pb-4 text-[0.95rem] text-zinc-600 dark:text-zinc-400">
      {children}
    </div>
  )
}
