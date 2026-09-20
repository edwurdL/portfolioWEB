import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/photos', label: 'Photos' },
  { to: '/coursework', label: 'Coursework' },
]

export default function Header() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Negative margins pull the padded hit areas outward so the link text
            itself lines up with the page's content column. On home, where the
            section rail is showing (xl and up), Home slides out to sit on the
            rail's line instead — 12.5rem left of the content column, which is
            where PageNav in pages/Home.tsx puts its markers. Leaving home slides
            it back. Tailwind v4 writes that offset to the `translate` property,
            so that — not `transform` — is what has to be transitioned, and the
            other pages set it to an explicit 0 rather than dropping the class,
            since a length only interpolates against another length. */}
        <Link
          to="/"
          className={`-ml-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-[color,translate] duration-500 ease-out ${
            pathname === '/'
              ? 'text-zinc-900 dark:text-zinc-100 xl:-translate-x-[12.5rem]'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 xl:translate-x-0'
          }`}
        >
          Home
        </Link>

        <nav className="-mr-2 flex items-center gap-1 sm:gap-2">
          {LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === to
                  ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
