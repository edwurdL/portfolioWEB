import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import profileImg from '../assets/headshot.webp'
import { fetchAnalytics, fetchPhotos } from '../lib/api'
import { createPhoto } from '../types'
import type { Photo, SiteAnalytics } from '../types'
import { PROJECTS, STATUS_LABEL } from './Projects'
import { TERMS } from './Coursework'
import { MOCK as MOCK_PHOTOS } from './Photos'
// Bio text lives in /aboutme.txt at the project root — edit that file and
// rebuild; blank lines between blocks render as separate paragraphs.
import bioText from '../../aboutme.txt?raw'

const BIO_PARAGRAPHS = bioText.trim().split(/\n\s*\n/)

const CONTACTS = [
  { label: 'Gmail', href: 'mailto:edlai@umich.edu' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/edwurdl/' },
  { label: 'GitHub', href: 'https://github.com/edwurdL' },
]

/** One rotation of a section card: an eyebrow and the body underneath it. */
type Preview = { key: string; eyebrow: string; content: ReactNode }

// Both lists are already newest-first on their own pages, so the cards cycle
// in that order.
const PROJECT_PREVIEWS: Preview[] = PROJECTS.map(p => ({
  key: p.id,
  eyebrow: STATUS_LABEL[p.status] ?? p.status,
  content: (
    <>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{p.title}</p>
        <span className="text-[0.65rem] text-zinc-400 dark:text-zinc-600 whitespace-nowrap tabular-nums">
          {p.date}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
        {p.shortDesc}
      </p>
    </>
  ),
}))

const COURSE_PREVIEWS: Preview[] = TERMS.flatMap(t =>
  t.courses.map(c => ({
    key: c.code,
    eyebrow: `${t.term}${t.planned ? ' · Upcoming' : ''}`,
    content: (
      <>
        <div className="flex items-baseline gap-2.5 mb-1">
          <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">
            {c.code}
          </span>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{c.name}</p>
        </div>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {c.desc}
        </p>
      </>
    ),
  }))
)

/** How many photos the gallery card rotates through before repeating. */
const PHOTO_PREVIEW_COUNT = 8

/**
 * Each card draws from its section at random rather than in order, so a visit
 * opens on something different. Shuffling the pool once per mount (rather than
 * picking a random index per swap) means nothing repeats until the rotation
 * comes back around, and nothing can show twice in a row.
 */
function shuffled<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function photoPreview(photo: Required<Photo>): Preview {
  return {
    key: photo.id,
    eyebrow: photo.category,
    content: (
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700"
          style={{ backgroundColor: photo.prominentColor }}
        >
          <img
            src={photo.url}
            alt={photo.meta.descriptor}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
            {photo.meta.descriptor}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {[photo.meta.location, photo.meta.date].filter(v => v && v !== 'N/A').join(' · ')}
          </p>
        </div>
      </div>
    ),
  }
}

const PHOTO_PLACEHOLDER: Preview = {
  key: 'loading',
  eyebrow: 'Loading',
  content: (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-3 w-2/5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-3 w-1/4 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
    </div>
  ),
}

/** Left-rail table of contents; each entry scrolls its section into view. */
const PAGE_SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'explore', label: 'Explore' },
  { id: 'analytics', label: 'Analytics' },
]

const LAST_SECTION = PAGE_SECTIONS[PAGE_SECTIONS.length - 1].id

function PageNav() {
  const [observed, setObserved] = useState(PAGE_SECTIONS[0].id)
  const [atBottom, setAtBottom] = useState(false)

  // The last section sits above the footer, so at full scroll it never reaches
  // the reading band below — bottoming out marks it instead.
  const active = atBottom ? LAST_SECTION : observed

  useEffect(() => {
    // Whichever section sits highest in the middle band of the viewport is the
    // one being read, so that's the entry the rail marks.
    const io = new IntersectionObserver(
      entries => {
        const inBand = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (inBand[0]) setObserved(inBand[0].target.id)
      },
      { rootMargin: '-25% 0px -55% 0px' }
    )
    for (const { id } of PAGE_SECTIONS) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const check = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      // On a page too short to scroll, everything is on screen already and the
      // observer's answer stands.
      setAtBottom(scrollable > 40 && window.scrollY >= scrollable - 24)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  const jumpTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    // Sits in the left margin of the centred content column, so it only appears
    // once the viewport is wide enough to have one. Its top lines up with the
    // headshot: the 56px header plus main's sm:pt-20 = 8.5rem. The right border
    // runs only as far as the entries do, separating the rail from the content.
    <nav
      aria-label="On this page"
      className="hidden xl:flex fixed z-30 top-[8.5rem] left-[calc(50%-35rem)] w-36 flex-col gap-3.5 pr-4 border-r border-zinc-200 dark:border-zinc-800"
    >
      {PAGE_SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => jumpTo(id)}
          aria-current={active === id ? 'true' : undefined}
          className="group flex items-center gap-2.5 text-left cursor-pointer"
        >
          <span
            className={`h-px transition-all duration-300 ${
              active === id
                ? 'w-7 bg-zinc-900 dark:bg-zinc-100'
                : 'w-3.5 bg-zinc-300 dark:bg-zinc-700 group-hover:w-5 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-500'
            }`}
          />
          <span
            className={`text-[0.65rem] uppercase tracking-[0.15em] transition-colors ${
              active === id
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}

export default function Home() {
  const [stats, setStats] = useState<SiteAnalytics | null>(null)
  const [photoPreviews, setPhotoPreviews] = useState<Preview[]>([PHOTO_PLACEHOLDER])
  const [projectPreviews] = useState(() => shuffled(PROJECT_PREVIEWS))
  const [coursePreviews] = useState(() => shuffled(COURSE_PREVIEWS))

  useEffect(() => {
    fetchAnalytics().then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    // Same fallback as the Photos page: if the API is unreachable (e.g. CORS
    // during localhost dev), preview the mock set instead of an empty slot.
    const toPreviews = (list: Required<Photo>[]) =>
      shuffled(list).slice(0, PHOTO_PREVIEW_COUNT).map(photoPreview)
    fetchPhotos()
      .then(data => setPhotoPreviews(toPreviews(data.length ? data.map(createPhoto) : MOCK_PHOTOS)))
      .catch(() => setPhotoPreviews(toPreviews(MOCK_PHOTOS)))
  }, [])

  const fmt = (n?: number) => (n === undefined ? '—' : n.toLocaleString())

  return (
    <>
      <PageNav />
    <main className="max-w-3xl mx-auto px-6 pt-14 pb-16 sm:pt-20">
      {/* Hero */}
      <section id="about" className="scroll-mt-20 flex items-center gap-5 mb-8">
        <img
          src={profileImg}
          alt="Profile"
          className="w-50 h-50 sm:w-40 sm:h-40 rounded-2xl object-cover flex-shrink-0 photo-smooth"
        />
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight text-zinc-900 dark:text-zinc-100">
            Eddie
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            CompE @ University of Michigan
          </p>
        </div>
      </section>

      <div className="mb-14 flex flex-col gap-4">
        {BIO_PARAGRAPHS.map((para, i) => (
          <p key={i} className="text-[0.95rem] leading-relaxed text-zinc-600 dark:text-zinc-400">
            {para}
          </p>
        ))}
      </div>

      <section id="contacts" className="scroll-mt-20 mb-14">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
          Contacts
        </h2>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {CONTACTS.map(({ label, href }) => (
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
      </section>

      {/* Explore — each card rotates through its section's items while idle */}
      <section id="explore" className="scroll-mt-20 mb-14">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
          Explore
        </h2>
        <div className="flex flex-col gap-3">
          <SectionCard
            to="/projects"
            label="Projects"
            desc="A timeline of things I’ve built"
            previews={projectPreviews}
            beat={0}
          />
          <SectionCard
            to="/photos"
            label="Photos"
            desc="A filterable gallery served from my self-hosted photo API"
            previews={photoPreviews}
            beat={1}
          />
          <SectionCard
            to="/coursework"
            label="Coursework"
            desc="Classes I’ve taken"
            previews={coursePreviews}
            beat={2}
          />
        </div>
      </section>

      {/* Site analytics */}
      <section id="analytics" className="scroll-mt-20">
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

      <footer className="mt-16 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap justify-between gap-2 text-xs text-zinc-400 dark:text-zinc-600">
        <span>© 2026 Eddie Lai</span>
        <span>Last updated: {__BUILD_DATE__}</span>
      </footer>
    </main>
    </>
  )
}

/** Seconds between preview swaps; each card is offset so they don't swap in unison. */
const CYCLE_MS = 4500
const BEAT_MS = 700

/**
 * A section link that rotates through that section's items — the newest
 * projects, photos, or courses — one at a time. Hovering (or focusing) a card
 * holds the current preview in place so it can be read and clicked.
 */
function SectionCard({
  to,
  label,
  desc,
  previews,
  beat,
}: {
  to: string
  label: string
  desc: string
  previews: Preview[]
  beat: number
}) {
  const [i, setI] = useState(0)
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (held || previews.length < 2) return
    const t = setInterval(() => setI(n => n + 1), CYCLE_MS + beat * BEAT_MS)
    return () => clearInterval(t)
  }, [held, previews.length, beat])

  const preview = previews.length ? previews[i % previews.length] : null

  return (
    <Link
      to={to}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="group block rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all"
    >
      <p className="flex items-center justify-between text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">
        {label}
        <span className="text-zinc-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </p>
      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{desc}</p>

      {preview && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {/* Fixed height so a two-line preview and a one-line one leave the card
              the same size; keyed so each swap replays the slide-in. */}
          <div key={preview.key} className="preview-swap h-[5.5rem] overflow-hidden">
            <p className="text-[0.6rem] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-2">
              {preview.eyebrow}
            </p>
            {preview.content}
          </div>
        </div>
      )}
    </Link>
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
