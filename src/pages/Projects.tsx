import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProjectCategory, ProjectEntry, ProjectStatus } from '../types'
import { projectPhoto } from '../lib/projectPhotos'
import { postForProject } from '../posts'
import { courseAnchor, PRIVATE_CODE_NOTE } from './Coursework'

/** How each status reads on a card: plain words, no colour coding. */
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  'completed':   'Completed',
  'in-progress': 'In progress',
  'deployed':    'Deployed · maintaining',
  'archived':    'Archived',
}

type Filter = 'all' | ProjectCategory

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'software', label: 'Software' },
]

// Remembered for the tab's session so opening a project page and coming back
// keeps the list filtered the same way. Storage can be unavailable (private
// windows, blocked site data), in which case the filter just starts at All.
const FILTER_KEY = 'projects-filter'

function savedFilter(): Filter {
  try {
    const v = sessionStorage.getItem(FILTER_KEY)
    return FILTERS.some(f => f.value === v) ? (v as Filter) : 'all'
  } catch {
    return 'all'
  }
}

/**
 * A project title with its icon, if it has one, right after the name. The
 * icon is pixel art, so it's scaled without smoothing; `size` is a height
 * class relative to the title's font size.
 */
export function TitleWithIcon({ title, icon, size }: { title: string; icon?: string; size: string }) {
  if (!icon) return <>{title}</>
  return (
    <>
      {title}
      <img
        src={icon}
        alt=""
        className={`inline-block w-auto ${size} ml-[0.3em] align-[-0.12em]`}
        style={{ imageRendering: 'pixelated' }}
      />
    </>
  )
}

export const PROJECTS: ProjectEntry[] = [
  {
    id: '13',
    cover: projectPhoto('grubblio', 'card-still.webp'),
    animated: projectPhoto('grubblio', 'card-preview.webp'),
    title: 'grubbl.io',
    category: 'software',
    date: 'Oct–Nov 2026',
    shortDesc: 'A daily food-guessing game at grubbl.io: name the dish from its ingredients, with Wordle-style hints, running on one Cloudflare Worker with a D1 database and optional accounts.',
    tags: ['TypeScript', 'React', 'Cloudflare Workers', 'Cloudflare D1', 'Better Auth'],
    status: 'deployed',
    repoUrl: 'https://github.com/edwurdL/grubblio',
    liveUrl: 'https://grubbl.io',
    // The game's chef-hat favicon, from the grubblio repo's public/favicon.svg.
    icon: projectPhoto('grubblio', 'icon.svg'),
  },
  {
    id: '10',
    // Same clip as its featured card on Home.
    cover: projectPhoto('robot-controls-library', 'test-route-still.webp'),
    animated: projectPhoto('robot-controls-library', 'test-route-preview.webp'),
    title: 'Robot Controls Library',
    category: 'robotics',
    date: 'Oct 2026',
    shortDesc: 'Our team’s own lightweight motion-control library, replacing the public one we’d relied on. It puts what I’ve learned in classes to work, accepts third-party sensors, tunes its own PID gains, and measures its own tracking wheel offsets.',
    tags: ['C++', 'Robotics', 'PID', 'Odometry', 'Embedded'],
    status: 'in-progress',
    repoUrl: '',
    liveUrl: '',
  },
  {
    id: '1',
    cover: projectPhoto('portfolio-website', 'cover.webp'),
    title: 'Portfolio Website & Self-Hosted Server',
    category: 'software',
    date: 'Jul 2026',
    shortDesc: 'This site, built with React and Tailwind, and the Mac mini at home that serves its photo and projects API.',
    tags: ['React', 'TypeScript', 'Tailwind', 'REST API', 'Self-Hosted'],
    status: 'deployed',
    repoUrl: 'https://github.com/edwurdL/eddieLaiPortfolio',
    liveUrl: '',
  },
  {
    id: '2',
    cover: projectPhoto('medical-census-dashboard', 'dashboard.webp'),
    title: 'Medical Census Analytics Dashboard',
    category: 'software',
    date: 'Jul 2026',
    shortDesc: 'A Tableau dashboard of 400k+ state-wide medical census data points, broken down by demographics and geography, with an ETL pipeline in progress.',
    tags: ['Tableau', 'ETL', 'Data Analytics', 'Data Viz'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
  {
    id: '3',
    cover: projectPhoto('esp32-sensor-coprocessor', 'IMG_9071.webp'),
    title: 'ESP32 Sensor Coprocessor for Position Tracking',
    category: 'robotics',
    date: 'Jun 2026',
    shortDesc: 'Third-party VL53L1X time-of-flight sensors read over I2C by an ESP32 coprocessor, streamed over serial to the main robot controller to validate position tracking.',
    tags: ['ESP32', 'I2C', 'Embedded', 'Sensors', 'Robotics'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
  {
    id: '4',
    cover: projectPhoto('vex-robot-structures', 'card-still.webp'),
    animated: projectPhoto('vex-robot-structures', 'card-preview.webp'),
    title: 'Custom-Manufactured VEX Robot Structures',
    category: 'robotics',
    date: 'Dec 2025 – May 2026',
    shortDesc: 'Laser-cut sheet plastic and metal structural parts for VEX competition robots, including a robot I designed and built, taken from an ABS prototype to a production version in polypropylene and aluminum.',
    tags: ['Mechanical Design', 'CAD', 'Laser Cutting', 'Manufacturing', 'VEX'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
  {
    // EECS 482 assignments, grouped into one card that links to the course on
    // the Coursework page rather than four cards with no write-ups.
    id: '482',
    title: 'Operating Systems Projects (EECS 482)',
    category: 'software',
    date: 'Jan–Apr 2026',
    shortDesc: 'Four EECS 482 projects in C++: a multithreaded pizza delivery program, a thread library, a virtual memory pager, and a multithreaded network file server.',
    tags: ['C++', 'Operating Systems', 'Concurrency', 'Virtual Memory', 'File Systems', 'Networking'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
    course: 'EECS 482',
  },
  {
    id: '12',
    cover: projectPhoto('custom-omni-wheels', '6-lineup.webp'),
    title: 'Custom Ball-Bearing Omni Wheels',
    category: 'robotics',
    date: 'Dec 2024 – Aug 2025',
    shortDesc: 'Ball-bearing omni wheels for VEX to cut rotational friction, iterated from a fully custom clamshell wheel to a hybrid of stock VEX wheels with lightweight bearing adapters.',
    tags: ['Mechanical Design', 'VEX', 'Robotics', 'Prototyping'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
  {
    id: '11',
    cover: projectPhoto('leap-hand-rl', 'card-still.webp'),
    animated: projectPhoto('leap-hand-rl', 'card-preview.webp'),
    title: 'LEAP Hand Reinforcement Learning',
    category: 'robotics',
    date: 'Jun–Jul 2024',
    shortDesc: 'A summer project to learn Linux by recreating the LEAP Hand reinforcement learning setup on ROS 2, debugging the wiring and code until training and testing ran on the real hand.',
    tags: ['Linux', 'ROS 2', 'Python', 'Reinforcement Learning', 'Robotics'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
  {
    id: '9',
    cover: projectPhoto('cr10-upgrade', 'IMG_6159.webp'),
    title: 'CR-10 Controller & Firmware Overhaul',
    category: 'robotics',
    date: 'Dec 2023',
    shortDesc: 'After a bad firmware flash bricked a Creality CR-10’s stock board, rebuilt it around a BTT SKR 3 with new stepper drivers, a TFT35 E3 touchscreen, and BLTouch auto bed leveling, running a custom Marlin build.',
    tags: ['3D Printing', 'Marlin', 'Firmware', 'Electronics', 'Hardware'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
]

export default function Projects() {
  const [filter, setFilter] = useState<Filter>(savedFilter)
  const inFilter = (f: Filter) => (f === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === f))
  const projects = inFilter(filter)

  const chooseFilter = (f: Filter) => {
    setFilter(f)
    try { sessionStorage.setItem(FILTER_KEY, f) } catch { /* not remembered; fine */ }
  }

  return (
    <main className="frame pt-14 pb-20 sm:pt-20">
      <header className="mb-10 sm:mb-14 pb-5 border-b border-zinc-900 dark:border-zinc-100 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tight text-zinc-900 dark:text-zinc-100">Projects</h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">Things I’ve built, newest first.</p>
        </div>

        <div role="group" aria-label="Filter projects" className="flex gap-6 text-sm">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => chooseFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`py-1 cursor-pointer transition-colors ${
                filter === f.value
                  ? 'text-zinc-900 dark:text-zinc-100 underline decoration-1 underline-offset-[6px]'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {f.label} <span className="tabular-nums text-zinc-500 dark:text-zinc-400">{inFilter(f.value).length}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(p => {
          // Projects with a post open their own page, coursework links to its
          // course, and the rest are a plain card.
          const post = postForProject(p.id)
          const to = post ? `/projects/${post.slug}` : p.course && `/coursework#${courseAnchor(p.course)}`
          const card = (
            <>
              <div className="mb-5 aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {p.cover ? (
                  // A clip plays where there is one; visitors who asked for
                  // reduced motion get its still frame instead. Clips keep their
                  // whole frame (many are portrait phone video); photos fill.
                  <picture>
                    {p.animated && <source srcSet={p.cover} media="(prefers-reduced-motion: reduce)" />}
                    <img
                      src={p.animated ?? p.cover}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.02] ${
                        p.animated ? 'object-contain' : 'object-cover'
                      }`}
                    />
                  </picture>
                ) : (
                  // No photo (coursework has none to show): the name, set large, stands in.
                  <p className="h-full flex items-end p-6 font-serif text-5xl tracking-tight text-zinc-400 dark:text-zinc-500">
                    {p.course ?? p.title}
                  </p>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-zinc-900 dark:text-zinc-100">{p.course ? 'Coursework' : STATUS_LABEL[p.status]}</span>
                <span className="text-zinc-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">{p.date}</span>
              </div>
              <h2 className="mt-2 font-serif text-[1.65rem] leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 text-balance">
                <span className={to ? 'decoration-1 underline-offset-4 group-hover:underline' : ''}>
                  <TitleWithIcon title={p.title} icon={p.icon} size="h-[0.8em]" />
                </span>
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">{p.shortDesc}</p>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                {p.tags.join(', ')}
                {/* Says outright that the missing repo link is on purpose. */}
                {p.course && <><br />{PRIVATE_CODE_NOTE}.</>}
              </p>
            </>
          )

          return to ? (
            <Link key={p.id} to={to} className="group block">{card}</Link>
          ) : (
            <div key={p.id}>{card}</div>
          )
        })}
      </div>

      <p className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-5 text-sm text-zinc-500 dark:text-zinc-400">
        More to be added soon.
      </p>
    </main>
  )
}
