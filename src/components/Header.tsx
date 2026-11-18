import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/coursework', label: 'Coursework' },
  // Last on purpose: a bit of personality, not the main event.
  { to: '/photos', label: 'Photos' },
]

export default function Header() {
  const { pathname } = useLocation()
  const linkClass = (active: boolean) =>
    `py-1 text-sm transition-colors ${
      active
        ? 'text-zinc-900 dark:text-zinc-100 underline decoration-1 underline-offset-[6px]'
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
    }`

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="frame h-14 flex items-center justify-between">
        <Link to="/" aria-current={pathname === '/' ? 'page' : undefined} className={linkClass(pathname === '/')}>
          Home
        </Link>

        {/* Below 360px (the smallest phones) the links pull in tighter so the
            row still fits without scrolling the page sideways. */}
        <nav className="flex items-center gap-5 max-[359px]:gap-3 sm:gap-7">
          {LINKS.map(({ to, label }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`)
            return (
              <Link key={to} to={to} aria-current={active ? 'page' : undefined} className={linkClass(active)}>
                {label}
              </Link>
            )
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
