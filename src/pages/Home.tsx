import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import profileImg from '../assets/headshot.webp'
import { loadPhotos } from '../lib/api'
import { projectPhoto } from '../lib/projectPhotos'
import { createPhoto } from '../types'
import type { Photo } from '../types'
import { PROJECTS, STATUS_LABEL, TitleWithIcon } from './Projects'
import { POSTS, postBySlug } from '../posts'
import { TERMS } from './Coursework'
import { MOCK as MOCK_PHOTOS } from './Photos'
// Bio text lives in /aboutme.txt at the project root — edit that file and
// rebuild; blank lines between blocks render as separate paragraphs.
import bioText from '../../aboutme.txt?raw'

const BIO_PARAGRAPHS = bioText.trim().split(/\n\s*\n/)

const EMAIL = 'edlai@umich.edu'

const CONTACTS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/edwurdl/' },
  { label: 'GitHub', href: 'https://github.com/edwurdL' },
]

/** One rotation of a section card: an eyebrow and the body underneath it. */
type Preview = { key: string; eyebrow: string; content: ReactNode }

/**
 * The projects the home page leads with, in the order shown, each with the
 * result worth remembering. Date (and the title, unless `title` overrides it
 * here) come from the project's entry in pages/Projects.tsx; each must have a
 * write-up in posts/index.ts.
 */
type Feature = {
  slug: string
  title?: string
  highlight: string
  detail: string
  /** Draws the card in teal, full width above the rest, so it stands out. */
  accent?: boolean
  /**
   * A picture or animation shown above the text, from the project's photo
   * folder. `still` is shown instead of an animated `src` to visitors who've
   * asked their system for reduced motion.
   */
  media?: { src?: string; still?: string; alt: string; fit: 'contain' | 'cover' }
}

const FEATURED = ([
  {
    slug: 'portfolio-website',
    // Shown here in place of the project's name on the Projects page.
    title: 'How This Website Works',
    accent: true,
    highlight: 'A self-hosted API serving 600+ photos',
    detail: 'This site: React, Tailwind and Vite, prerendered for link previews, backed by my own REST server behind Cloudflare.',
  },
  {
    slug: 'robot-controls-library',
    // A 216px-wide animated WebP made from the post's test-route.gif (12.5 MB),
    // so the home page doesn't download the full GIF.
    media: {
      src: projectPhoto('robot-controls-library', 'test-route-preview.webp'),
      still: projectPhoto('robot-controls-library', 'test-route-still.webp'),
      alt: 'The robot driving a test route after auto-tuning',
      fit: 'contain',
    },
    highlight: 'Autotuned PID cut a 90° turn from 1.8 s to 0.68 s',
    detail: 'My team’s own motion-control library. Its autotune measures the drivetrain, computes the gains, then tests them on the robot: kP climbed from 0.44 to 0.91 before a turn overshot.',
  },
  {
    slug: 'medical-census-dashboard',
    media: {
      src: projectPhoto('medical-census-dashboard', 'dashboard.webp'),
      alt: 'The census dashboard',
      fit: 'cover',
    },
    highlight: '400,000+ census data points in one dashboard',
    detail: 'A Tableau dashboard for trends across demographics and geography, fed by an ETL pipeline I’m building that adds stay IDs and readmission flags.',
  },
] as Feature[]).map(f => {
  const post = postBySlug(f.slug)
  const project = post && PROJECTS.find(p => p.id === post.projectId)
  if (!project) throw new Error(`Featured project "${f.slug}" has no write-up or project entry`)
  return { ...f, title: f.title ?? project.title, project }
})

// Only projects with a write-up rotate through the Explore card, so whatever it
// shows has a page behind it. Already newest-first, as on the Projects page.
const PROJECT_PREVIEWS: Preview[] = PROJECTS.filter(p => POSTS.some(post => post.projectId === p.id)).map(p => ({
  key: p.id,
  eyebrow: STATUS_LABEL[p.status] ?? p.status,
  content: (
    <>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
          <TitleWithIcon title={p.title} icon={p.icon} size="h-[1.1em]" />
        </p>
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
    eyebrow: `${t.term}${t.current ? ' · In progress' : ''}`,
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
  { id: 'featured', label: 'Featured' },
  { id: 'explore', label: 'Explore' },
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
  const [photoPreviews, setPhotoPreviews] = useState<Preview[]>([PHOTO_PLACEHOLDER])
  const [projectPreviews] = useState(() => shuffled(PROJECT_PREVIEWS))
  const [coursePreviews] = useState(() => shuffled(COURSE_PREVIEWS))

  useEffect(() => {
    // Same fallback as the Photos page: if the API is unreachable (e.g. CORS
    // during localhost dev), preview the mock set instead of an empty slot.
    const toPreviews = (list: Required<Photo>[]) =>
      shuffled(list).slice(0, PHOTO_PREVIEW_COUNT).map(photoPreview)
    loadPhotos()
      .then(data => setPhotoPreviews(toPreviews(data.length ? data.map(createPhoto) : MOCK_PHOTOS)))
      .catch(() => setPhotoPreviews(toPreviews(MOCK_PHOTOS)))
  }, [])

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
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          {/* Plain text rather than a mailto link, so it can be copied by anyone
              without a mail app set up. */}
          <span className="text-sm text-zinc-500 dark:text-zinc-400 select-all">{EMAIL}</span>
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

      <section id="featured" className="scroll-mt-20 mb-14">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
          Featured projects
        </h2>
        {/* The accent card runs full width on top; the rest sit side by side
            under it (stacked on a phone), each led by its picture. */}
        <div className="flex flex-col gap-3">
          {FEATURED.filter(f => f.accent).map(f => <FeaturedCard key={f.slug} {...f} />)}
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURED.filter(f => !f.accent).map(f => <FeaturedCard key={f.slug} {...f} />)}
          </div>
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
            to="/coursework"
            label="Coursework"
            desc="Classes I’ve taken"
            previews={coursePreviews}
            beat={1}
          />
          <SectionCard
            to="/photos"
            label="Photos"
            desc="A filterable gallery served from my self-hosted photo API"
            previews={photoPreviews}
            beat={2}
          />
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

function FeaturedCard({ slug, title, highlight, detail, accent, media, project }: (typeof FEATURED)[number]) {
  return (
    <Link
      to={`/projects/${slug}`}
      // The accent card is teal, the same colour as this project's
      // "deployed" status on the Projects page.
      className={`group flex flex-col rounded-xl border overflow-hidden hover:shadow-sm transition-all ${
        accent
          ? 'border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 hover:border-teal-500 dark:hover:border-teal-600'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
      }`}
    >
      {media?.src && (
        <div className="h-44 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
          <picture>
            {media.still && <source srcSet={media.still} media="(prefers-reduced-motion: reduce)" />}
            <img
              src={media.src}
              alt={media.alt}
              loading="lazy"
              decoding="async"
              className={`w-full h-full ${media.fit === 'cover' ? 'object-cover object-left-top' : 'object-contain'}`}
            />
          </picture>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <p className={`text-sm font-medium ${accent ? 'text-teal-800 dark:text-teal-300' : 'text-zinc-800 dark:text-zinc-200'}`}>
            {title}
          </p>
          <span className={`text-[0.65rem] whitespace-nowrap tabular-nums ${accent ? 'text-teal-600 dark:text-teal-500' : 'text-zinc-400 dark:text-zinc-600'}`}>
            {project.date}
          </span>
        </div>
        <p className={`font-serif text-2xl leading-snug mb-2 ${accent ? 'text-teal-950 dark:text-teal-50' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {highlight}
        </p>
        <p className={`text-sm leading-relaxed ${accent ? 'text-teal-900/75 dark:text-teal-100/70' : 'text-zinc-500 dark:text-zinc-400'}`}>{detail}</p>
        <p className={`mt-auto pt-3 text-xs transition-colors ${
          accent
            ? 'text-teal-700 dark:text-teal-400 group-hover:text-teal-900 dark:group-hover:text-teal-200'
            : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
        }`}>
          Read the write-up{' '}
          <span className="inline-block group-hover:translate-x-0.5 transition-transform">→</span>
        </p>
      </div>
    </Link>
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
