import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import profileImg from '../assets/deadfile.png'
import { fetchAnalytics } from '../lib/api'
import type { SiteAnalytics } from '../types'

const SOCIALS = [
  { label: 'Gmail', href: 'mailto:edlai@umich.edu' },
  { label: 'GitHub', href: 'https://github.com/edwurdL' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
]

const SECTIONS = [
  { to: '/projects', label: 'Projects', desc: 'A timeline of things I’ve built — systems, ML, and web.' },
  { to: '/photos', label: 'Photos', desc: 'A filterable gallery served from my self-hosted photo API.' },
  { to: '/coursework', label: 'Coursework', desc: 'Classes I’ve taken, term by term.' },
]

export default function Home() {
  const [stats, setStats] = useState<SiteAnalytics | null>(null)

  useEffect(() => {
    fetchAnalytics().then(setStats).catch(() => {})
  }, [])

  const fmt = (n?: number) => (n === undefined ? '—' : n.toLocaleString())

  return (
    <main className="max-w-2xl mx-auto px-6 pt-14 pb-16 sm:pt-20">
      {/* Hero */}
      <section className="flex items-center gap-5 mb-8">
        <img
          src={profileImg}
          alt="Profile"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0"
        />
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight text-zinc-900 dark:text-zinc-100">
            Eddie
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            CS @ University of Michigan
          </p>
        </div>
      </section>

      <p className="text-[0.95rem] leading-relaxed text-zinc-600 dark:text-zinc-400 mb-6">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur.
      </p>

      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-14">
        {SOCIALS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border-b border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 pb-px"
          >
            {label}
          </a>
        ))}
      </div>

      {/* Explore */}
      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
          Explore
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {SECTIONS.map(({ to, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all"
            >
              <p className="flex items-center justify-between text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                {label}
                <span className="text-zinc-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </p>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Site analytics */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Site analytics
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Last 24 hours · Cloudflare
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatTile label="Unique visitors" value={fmt(stats?.uniqueVisitors)} />
          <StatTile label="Requests" value={fmt(stats?.totalRequests)} />
          <StatTile label="Bandwidth" value={formatBytes(stats?.totalBytes)} />
        </div>
      </section>

      <footer className="mt-16 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 dark:text-zinc-600">
        © 2026 Eddie Lai
      </footer>
    </main>
  )
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${i === 0 ? v : v >= 100 ? v.toFixed(0) : v.toFixed(1)} ${units[i]}`
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-5 py-4">
      <p className="text-[0.65rem] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-light text-zinc-800 dark:text-zinc-200 tabular-nums">
        {value}
      </p>
    </div>
  )
}
