import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import profileImg from '../assets/headshot.webp'
import { loadPhotos } from '../lib/api'
import { projectPhoto } from '../lib/projectPhotos'
import { createPhoto } from '../types'
import type { Photo } from '../types'
import { PROJECTS, STATUS_LABEL, TitleWithIcon } from './Projects'
import { POSTS, postBySlug, postForProject } from '../posts'
import { TERMS, courseAnchor } from './Coursework'
import { MOCK as MOCK_PHOTOS } from './Photos'
import PhotoCube from '../components/PhotoCube'
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
type Preview = { key: string; content: ReactNode }

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
  content: (
    <>
      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
        <TitleWithIcon title={p.title} icon={p.icon} size="h-[1.05em]" />
      </p>
      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">
        {STATUS_LABEL[p.status]} · {p.date}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2">{p.shortDesc}</p>
    </>
  ),
}))

const COURSE_PREVIEWS: Preview[] = TERMS.flatMap(t =>
  t.courses.map(c => ({
    key: c.code,
    content: (
      <>
        <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{c.name}</p>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">
          {c.code} · {t.term}{t.current ? ', in progress' : ''}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2">{c.desc}</p>
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
    content: (
      <div className="flex gap-4">
        <div className="w-20 h-20 flex-shrink-0 overflow-hidden" style={{ backgroundColor: photo.prominentColor }}>
          <img src={photo.url} alt={photo.meta.descriptor} loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{photo.meta.descriptor}</p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 truncate">
            {[photo.category, photo.meta.location, photo.meta.date].filter(v => v && v !== 'N/A').join(' · ')}
          </p>
        </div>
      </div>
    ),
  }
}

const PHOTO_PLACEHOLDER: Preview = {
  key: 'loading',
  content: (
    <div className="flex gap-4" aria-label="Loading photos">
      <div className="w-20 h-20 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      <div className="flex-1 flex flex-col gap-2 pt-1">
        <div className="h-3.5 w-2/5 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-3.5 w-1/4 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
    </div>
  ),
}

/** Left-rail table of contents; each entry scrolls its section into view. */
const PAGE_SECTIONS = [
  { id: 'about', label: 'About' },
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
    // The frame's left column, from xl up. Its top lines up with the headshot:
    // the 56px header plus main's sm:pt-20 = 8.5rem.
    <nav aria-label="On this page" className="hidden xl:flex sticky top-[8.5rem] self-start mt-20 flex-col gap-3">
      {PAGE_SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => jumpTo(id)}
          aria-current={active === id ? 'true' : undefined}
          className="group flex items-center gap-3 text-left text-sm cursor-pointer"
        >
          <span
            className={`h-px transition-all duration-300 ${
              active === id
                ? 'w-6 bg-zinc-900 dark:bg-zinc-100'
                : 'w-3 bg-zinc-300 dark:bg-zinc-700 group-hover:w-4.5 group-hover:bg-zinc-500'
            }`}
          />
          <span
            className={`transition-colors ${
              active === id
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}

// "Now" reads from the same data as the Projects and Coursework pages, so it
// stays current as those are edited: in-progress projects and this term's classes.
const BUILDING = PROJECTS.filter(p => p.status === 'in-progress')
const CURRENT_TERM = TERMS.find(t => t.current)
const nowLink = 'text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-current'

function NowPanel() {
  return (
    <aside aria-labelledby="now" className="mt-10 lg:mt-0 lg:w-[26rem] border-t border-zinc-900 dark:border-zinc-100 pt-4">
      <h2 id="now" className="font-serif text-2xl tracking-tight text-zinc-900 dark:text-zinc-100">Now</h2>
      <dl className="mt-4 grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm leading-relaxed">
        {BUILDING.length > 0 && (
          <>
            <dt className="text-zinc-500 dark:text-zinc-400">Building</dt>
            <dd className="flex flex-col">
              {BUILDING.map(p => {
                const post = postForProject(p.id)
                return post ? (
                  <Link key={p.id} to={`/projects/${post.slug}`} className={`self-start ${nowLink}`}>{p.title}</Link>
                ) : (
                  <span key={p.id} className="text-zinc-900 dark:text-zinc-100">{p.title}</span>
                )
              })}
            </dd>
          </>
        )}
        {CURRENT_TERM && (
          <>
            <dt className="text-zinc-500 dark:text-zinc-400">Taking</dt>
            <dd className="flex flex-col">
              {CURRENT_TERM.courses.map(c => (
                <Link key={c.code} to={`/coursework#${courseAnchor(c.code)}`} className={`self-start ${nowLink}`}>
                  {c.code}, {c.name}
                </Link>
              ))}
            </dd>
          </>
        )}
        <dt className="text-zinc-500 dark:text-zinc-400">Contact</dt>
        <dd className="flex flex-wrap gap-x-4 gap-y-1">
          {/* Plain text rather than a mailto link, so it can be copied by anyone
              without a mail app set up. */}
          <span className="text-zinc-900 dark:text-zinc-100 select-all">{EMAIL}</span>
          {CONTACTS.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={nowLink}>
              {label}
            </a>
          ))}
        </dd>
      </dl>
    </aside>
  )
}

/** A section's title, sitting on a full-width rule like a catalogue heading. */
function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mb-8 border-t border-zinc-900 dark:border-zinc-100 pt-4 font-serif text-3xl tracking-tight text-zinc-900 dark:text-zinc-100">
      {children}
    </h2>
  )
}

export default function Home() {
  const [photoPreviews, setPhotoPreviews] = useState<Preview[]>([PHOTO_PLACEHOLDER])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [projectPreviews] = useState(() => shuffled(PROJECT_PREVIEWS))
  const [coursePreviews] = useState(() => shuffled(COURSE_PREVIEWS))

  useEffect(() => {
    // Same rule as the Photos page: the mock set only stands in during local
    // dev. Live, an unreachable API just leaves the card without a preview.
    const fallback = import.meta.env.DEV ? MOCK_PHOTOS : []
    const toPreviews = (list: Required<Photo>[]) =>
      shuffled(list).slice(0, PHOTO_PREVIEW_COUNT).map(photoPreview)
    loadPhotos()
      .then(data => (data.length ? data.map(createPhoto) : fallback), () => fallback)
      .then(list => {
        setPhotos(list)
        setPhotoPreviews(toPreviews(list))
      })
  }, [])

  return (
    <div className="frame xl:grid xl:grid-cols-[9rem_minmax(0,1fr)] xl:gap-10">
      <PageNav />
      <main className="min-w-0 pt-14 pb-16 sm:pt-20">
        <section id="about" className="scroll-mt-20 mb-10 lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div className="flex items-end gap-6 sm:gap-10">
          <img
            src={profileImg}
            alt="Eddie Lai"
            className="w-32 h-32 sm:w-52 sm:h-52 object-cover flex-shrink-0 photo-smooth"
          />
          <div className="min-w-0">
            <h1 className="font-serif text-6xl sm:text-8xl leading-[0.9] tracking-tight text-zinc-900 dark:text-zinc-100">
              Eddie
            </h1>
            <p className="mt-3 text-zinc-500 dark:text-zinc-400">CompE @ University of Michigan</p>
          </div>
          </div>
          <NowPanel />
        </section>

        {/* The plot fills the blank beside the bio and the gap under it. It is
            absolutely positioned on wide screens, so the bio alone sets the row
            height and the plot can never push the page around. */}
        <div className="mb-20 lg:mb-0 lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-12">
          <div className="max-w-[60ch] flex flex-col gap-4 lg:pb-20">
            {BIO_PARAGRAPHS.map((para, i) => (
              <p key={i} className="text-[1.075rem] leading-relaxed text-zinc-700 dark:text-zinc-300">
                {para}
              </p>
            ))}
          </div>
          <div className="relative mt-10 h-72 lg:mt-0 lg:h-auto">
            <PhotoCube photos={photos} className="absolute inset-x-0 top-0 bottom-0 lg:bottom-8" />
          </div>
        </div>

        <section id="featured" className="scroll-mt-20 mb-20">
          <SectionHeading>Featured projects</SectionHeading>
          {/* The lead piece runs full width on top; the rest hang side by side
              under it (stacked on a phone), each led by its picture. */}
          <div className="flex flex-col gap-16">
            {FEATURED.filter(f => f.accent).map(f => <FeaturedCard key={f.slug} {...f} />)}
            <div className="grid gap-x-10 gap-y-16 md:grid-cols-2">
              {FEATURED.filter(f => !f.accent).map(f => <FeaturedCard key={f.slug} {...f} />)}
            </div>
          </div>
        </section>

        <section id="explore" className="scroll-mt-20 mb-14">
          <SectionHeading>Explore</SectionHeading>
          {/* Each column rotates through its section's items while idle. */}
          <div className="grid gap-x-10 gap-y-14 md:grid-cols-3">
            <SectionCard to="/projects" label="Projects" desc="A timeline of things I’ve built" previews={projectPreviews} beat={0} />
            <SectionCard to="/coursework" label="Coursework" desc="Classes I’ve taken" previews={coursePreviews} beat={1} />
            <SectionCard
              to="/photos"
              label="Photos"
              desc="A filterable gallery served from my self-hosted photo API"
              previews={photoPreviews}
              beat={2}
            />
          </div>
        </section>

        <footer className="mt-24 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap justify-between gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>© 2026 Eddie Lai</span>
          <span>Last updated {__BUILD_DATE__}</span>
        </footer>
      </main>
    </div>
  )
}

function FeaturedCard({ slug, title, highlight, detail, accent, media, project }: (typeof FEATURED)[number]) {
  const meta = (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="font-medium text-zinc-900 dark:text-zinc-100">{title}</span>
      <span className="text-zinc-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">{project.date}</span>
    </div>
  )
  const more = (
    <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
      Read the write-up
    </p>
  )
  const headline = (size: string) => (
    <p className={`mt-3 font-serif ${size} leading-[1.08] tracking-tight text-zinc-900 dark:text-zinc-100 text-balance decoration-1 underline-offset-[0.12em] group-hover:underline`}>
      {highlight}
    </p>
  )

  // The lead piece has no picture: its headline is the picture.
  if (accent) {
    return (
      <Link to={`/projects/${slug}`} className="group block lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16 lg:items-end">
        <div>
          {meta}
          {headline('text-4xl sm:text-6xl')}
        </div>
        <div>
          <p className="mt-4 lg:mt-0 max-w-[60ch] text-zinc-600 dark:text-zinc-400 leading-relaxed">{detail}</p>
          {more}
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/projects/${slug}`} className="group block">
      {media?.src && (
        <div className="mb-5 aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <picture>
            {media.still && <source srcSet={media.still} media="(prefers-reduced-motion: reduce)" />}
            <img
              src={media.src}
              alt={media.alt}
              loading="lazy"
              decoding="async"
              className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.015] ${
                media.fit === 'cover' ? 'object-cover object-left-top' : 'object-contain'
              }`}
            />
          </picture>
        </div>
      )}
      {meta}
      {headline('text-3xl')}
      <p className="mt-3 max-w-[60ch] text-zinc-600 dark:text-zinc-400 leading-relaxed">{detail}</p>
      {more}
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
    // Content that changes on its own counts as motion too.
    if (held || previews.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
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
      className="group block"
    >
      <p className="font-serif text-2xl text-zinc-900 dark:text-zinc-100 decoration-1 underline-offset-4 group-hover:underline">{label}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>

      {preview && (
        <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          {/* Fixed height so a two-line preview and a one-line one leave the
              column the same size; keyed so each swap replays the slide-in. */}
          <div key={preview.key} className="preview-swap h-[6.5rem] overflow-hidden">
            {preview.content}
          </div>
        </div>
      )}
    </Link>
  )
}
