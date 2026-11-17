import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProjectCategory, ProjectEntry, ProjectStatus } from '../types'
import { photosFor } from '../lib/projectPhotos'
import { postForProject } from '../posts'
import { courseAnchor, PRIVATE_CODE_NOTE } from './Coursework'

export const STATUS_STYLE: Record<ProjectStatus, string> = {
  'completed':   'bg-green-50  dark:bg-green-900/20 text-green-700  dark:text-green-400',
  'in-progress': 'bg-blue-50   dark:bg-blue-900/20  text-blue-700   dark:text-blue-400',
  'deployed':    'bg-teal-50   dark:bg-teal-900/20  text-teal-700   dark:text-teal-400',
  'archived':    'bg-zinc-100  dark:bg-zinc-800      text-zinc-500   dark:text-zinc-400',
}

// Most pills just print the status; this one needs both halves of the story.
export const STATUS_LABEL: Partial<Record<ProjectStatus, string>> = {
  'deployed': 'deployed · maintaining',
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

export const PROJECTS: ProjectEntry[] = [
  {
    id: '10',
    title: 'Robot Controls Library',
    category: 'robotics',
    date: 'Oct 2026',
    shortDesc: 'Our team’s own lightweight motion-control library, replacing the public library we’d relied on. It applies what I’ve learned in classes to improve overall performance and is built to be extensible for our needs, with PID auto-tuning and automatic tracking wheel offsets.',
    fullDesc: 'My team has previously relied on LemLib, a public motion-control library developed by other teams, but it’s no longer being actively updated and can feel sluggish at times when writing autonomous routes. This year I’m developing our own library to replace it, kept lightweight for our purposes. Its main goals are to apply what I’ve learned in my classes to improve the robot’s performance overall, and to be extensible so it can grow with our future needs, such as integrating third-party sensors alongside the stock hardware. On top of that, it adds automatic tuning of PID constants, so controllers can be dialed in from measured robot behavior instead of hand-tuned by trial and error, and automatic tracking wheel offset calibration, so odometry no longer depends on manually measuring where each tracking wheel sits on the chassis.',
    tags: ['C++', 'Robotics', 'PID', 'Odometry', 'Embedded'],
    status: 'in-progress',
    repoUrl: '',
    liveUrl: '',
    images: photosFor('robot-controls-library'),
  },
  {
    id: '1',
    title: 'Portfolio Website & Self-Hosted Server',
    category: 'software',
    date: 'Jul 2026',
    shortDesc: 'Personal portfolio built with React and Tailwind, backed by a self-hosted remote server serving a custom photo and projects API.',
    fullDesc: 'A responsive personal portfolio built from scratch with React 19, Tailwind CSS v4, and Vite — featuring dark mode with animated theme transitions, page transitions, a filterable masonry photo gallery, and live site analytics. Content is served from a self-hosted remote server exposing a REST API for photos (with full EXIF metadata) and projects, fronted by Cloudflare for caching and traffic analytics.',
    tags: ['React', 'TypeScript', 'Tailwind', 'REST API', 'Self-Hosted'],
    status: 'deployed',
    repoUrl: 'https://github.com/edwurdL/eddieLaiPortfolio',
    liveUrl: '',
    images: photosFor('portfolio-website'),
  },
  {
    id: '2',
    title: 'Medical Census Analytics Dashboard',
    category: 'software',
    date: 'Jul 2026',
    shortDesc: 'Tableau dashboard aggregating 400k+ state-wide medical census data points for high-dimensional trend analysis, with an ETL pipeline in progress.',
    fullDesc: 'Developed a medical census analytics dashboard aggregating over 400,000 state-wide data points, enabling deep trend visibility and high-dimensional analysis across demographic and geographic breakdowns. Currently building an ETL data pipeline to automate ingestion, cleaning, and transformation of incoming census data feeding the dashboard.',
    tags: ['Tableau', 'ETL', 'Data Analytics', 'Data Viz'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
    // Two slots held open for dashboard screenshots — swap each entry for a
    // real file in src/assets/projects/.
    images: photosFor('medical-census-dashboard'),
  },
  {
    id: '3',
    title: 'ESP32 Sensor Coprocessor for Position Tracking',
    category: 'robotics',
    date: 'Jun 2026',
    shortDesc: 'Third-party VL53L1X time-of-flight sensors read over I2C by an ESP32 coprocessor, streamed over serial to the main robot controller to validate position tracking.',
    fullDesc: 'Integrated third-party VL53L1X time-of-flight distance sensors into a robot whose controller had no native support for them, using an ESP32 as a dedicated sensor coprocessor. The ESP32 drives the sensors over I2C — handling device addressing, configuration, and ranging timing — and forwards readings to the main robot controller over a serial link, keeping sensor I/O off the controller’s main loop. Used the resulting distance measurements as an independent reference for position tracking, cross-checking the robot’s reported pose against measured distances to fixed field elements to confirm the tracking held up over a match.',
    tags: ['ESP32', 'I2C', 'Embedded', 'Sensors', 'Robotics'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
    images: photosFor('esp32-sensor-coprocessor'),
  },
  {
    id: '4',
    title: 'Custom-Manufactured VEX Robot Structures',
    category: 'robotics',
    date: 'Jan–May 2026',
    shortDesc: 'Laser-cut sheet plastic and metal structural parts for VEX competition robots, manufactured in-house to trade weight against rigidity where each subsystem needed it.',
    fullDesc: 'Designed and manufactured custom structural components for VEX competition robots, replacing stock parts with laser-cut sheet plastic and metal chosen per subsystem. Selected material and thickness against the loads each part actually carried, then cut lightening pockets into low-stress regions to strip mass without giving up stiffness, and added gussets and laminated layers where parts saw torsion. Matched hole patterns to the VEX grid so custom parts stayed compatible with off-the-shelf hardware and could be swapped in mid-build. Iterated across the season — each revision tested on the robot, then re-cut — converging on structures that stayed rigid under impact while keeping the robot light enough to hit its handling targets.',
    tags: ['Mechanical Design', 'CAD', 'Laser Cutting', 'Manufacturing', 'VEX'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
    images: photosFor('vex-robot-structures'),
  },
  {
    // EECS 482 assignments, grouped into one card that links to the course on
    // the Coursework page rather than four cards with no write-ups.
    id: '482',
    title: 'Operating Systems Projects (EECS 482)',
    category: 'software',
    date: 'Jan–Apr 2026',
    shortDesc: 'Four EECS 482 projects in C++: a multithreaded pizza delivery program, a thread library, a virtual memory pager, and a multithreaded network file server.',
    fullDesc: '',
    tags: ['C++', 'Operating Systems', 'Concurrency', 'Virtual Memory', 'File Systems', 'Networking'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
    images: [],
    course: 'EECS 482',
  },
  {
    id: '12',
    title: 'Custom Ball-Bearing Omni Wheels',
    category: 'robotics',
    date: 'Dec 2024 – Aug 2025',
    shortDesc: 'Ball-bearing omni wheels for VEX to cut rotational friction, iterated from a fully custom clamshell wheel to a hybrid of stock VEX wheels with lightweight bearing adapters.',
    fullDesc: 'VEX robots typically run on VEX’s own omni wheels. To reduce rotational friction, designed ball-bearing omni wheels over several iterations: a fully custom clamshell wheel reusing high-strength-shaft bearings (heavy, with the gear printed into the backplate), a modular, pocketed version with swappable gears, and a hybrid that adds lightweight small-bearing adapters to stock VEX wheels. Also prototyped a replacement wheel housing with bearings built in. The hybrid is the design in use.',
    tags: ['Mechanical Design', 'VEX', 'Robotics', 'Prototyping'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
    // Photos are placed in its post (src/posts/CustomOmniWheels.tsx); the
    // two-photo modal list doesn't apply.
    images: [],
  },
  {
    id: '11',
    title: 'LEAP Hand Reinforcement Learning',
    category: 'robotics',
    date: 'Jun–Jul 2024',
    shortDesc: 'A summer project to learn Linux by recreating the LEAP Hand reinforcement learning setup on ROS 2, debugging the wiring and code until training and testing ran on the real hand.',
    fullDesc: 'A project after freshman year focused on learning Linux and getting a real robotics setup running. Recreated the research setup for the LEAP Hand, a low-cost anthropomorphic robot hand from Carnegie Mellon, so it ran correctly: working in ROS 2, setting up virtual environments, resolving compatibility issues, moving from a virtual machine to a dual-boot Linux PC when training needed a GPU, and debugging both the wiring and the Python code. Then ran the reinforcement learning training and tested the result on the hand.',
    tags: ['Linux', 'ROS 2', 'Python', 'Reinforcement Learning', 'Robotics'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
    // Photos are placed in its post (src/posts/LeapHandRl.tsx).
    images: [],
  },
  {
    id: '9',
    title: 'CR-10 Controller & Firmware Overhaul',
    category: 'robotics',
    date: 'Dec 2023',
    shortDesc: 'After a bad firmware flash bricked a Creality CR-10’s stock board, rebuilt it around a BTT SKR 3 with new stepper drivers, a TFT35 E3 touchscreen, and BLTouch auto bed leveling, running a custom Marlin build.',
    fullDesc: 'Set out to add a BLTouch auto bed leveling probe to a Creality CR-10, which meant flashing new firmware onto its stock motherboard. The wrong firmware went on, and with no bootloader on that board, the printer was bricked. Rather than revive the stock board, overhauled the electronics: a BIGTREETECH SKR 3 motherboard with new silent stepper drivers, a BIGTREETECH TFT35 E3 touchscreen in place of the stock knob controller, and the BLTouch. Configured a custom Marlin firmware build for this printer — probe offsets and deployment, mesh bed leveling, driver and endstop setup, and thermal settings — flashed it onto the SKR 3, then validated the rebuild with leveling runs and first-layer test prints until the bed compensated correctly across its full area.',
    tags: ['3D Printing', 'Marlin', 'Firmware', 'Electronics', 'Hardware'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
    images: photosFor('cr10-upgrade'),
  },
]

export default function Projects() {
  const [filter, setFilter] = useState<Filter>(savedFilter)
  const projects = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === filter)
  const [selected, setSelected] = useState<ProjectEntry | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [shotRatios, setShotRatios] = useState<Record<string, string>>({})
  const [zoomed, setZoomed] = useState<string | null>(null)
  const [zoomVisible, setZoomVisible] = useState(false)

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => setModalVisible(true))
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selected])

  useEffect(() => {
    if (zoomed) requestAnimationFrame(() => setZoomVisible(true))
  }, [zoomed])

  const closeModal = () => {
    setModalVisible(false)
    setTimeout(() => setSelected(null), 250)
  }

  const closeZoom = () => {
    setZoomVisible(false)
    setTimeout(() => setZoomed(null), 250)
  }

  const chooseFilter = (f: Filter) => {
    setFilter(f)
    try { sessionStorage.setItem(FILTER_KEY, f) } catch { /* not remembered; fine */ }
  }

  // Group consecutive projects by year so the timeline can show a year header
  // (like the Coursework page). Projects are already newest-first, ordered by
  // when they ended, so a range like "Dec 2024 – Aug 2025" files under 2025.
  const groups: { year: string; items: ProjectEntry[] }[] = []
  for (const p of projects) {
    const year = p.date.match(/\d{4}/g)?.at(-1) ?? '—'
    const last = groups[groups.length - 1]
    if (last && last.year === year) last.items.push(p)
    else groups.push({ year, items: [p] })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-500">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100 mb-1">Projects</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Things I’ve built.</p>

          <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2 mt-5">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => chooseFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
                  filter === f.value
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />

          {groups.map(({ year, items }) => (
            <div key={year}>
              {/* Year header sitting on the timeline */}
              <div className="relative pl-8 mb-5 first:mt-0">
                <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-2 ring-white dark:ring-zinc-900" />
                <h2 className="text-sm font-medium tracking-[0.2em] text-zinc-500 dark:text-zinc-400 tabular-nums">
                  {year}
                </h2>
              </div>

              {items.map(p => {
                // Projects with a post open their own page, coursework links to its
                // course, and the rest open the modal.
                const post = postForProject(p.id)
                const courseLink = p.course && `/coursework#${courseAnchor(p.course)}`
                const cardClass = 'group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all'
                const cardBody = (
                  <>
                    {/* On a phone the badge and date drop below the title so neither
                        squeezes it; from sm up they share its row. */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-2">
                      <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{p.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.course ? (
                          <span className="text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                            Coursework
                          </span>
                        ) : (
                          <span className={`text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}>
                            {STATUS_LABEL[p.status] ?? p.status}
                          </span>
                        )}
                        <span className="text-xs text-zinc-400 dark:text-zinc-600 whitespace-nowrap">{p.date}</span>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">{p.shortDesc}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map(tag => (
                        <span key={tag} className="text-[0.65rem] uppercase tracking-wide px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {(post || courseLink) && (
                      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        {post ? 'Read the write-up' : `See ${p.course} on the Coursework page`}{' '}
                        <span className="inline-block group-hover:translate-x-0.5 transition-transform">→</span>
                      </p>
                    )}
                    {/* Says outright that the missing repo link is on purpose. */}
                    {p.course && (
                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{PRIVATE_CODE_NOTE}</p>
                    )}
                  </>
                )

                return (
                  <div key={p.id} className="relative pl-8 mb-8">
                    {/* Timeline dot */}
                    <div className="absolute left-[-4px] top-5 w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 ring-2 ring-white dark:ring-zinc-900" />

                    {/* Card */}
                    {post ? (
                      <Link to={`/projects/${post.slug}`} className={cardClass}>{cardBody}</Link>
                    ) : courseLink ? (
                      <Link to={courseLink} className={cardClass}>{cardBody}</Link>
                    ) : (
                      <div onClick={() => setSelected(p)} className={cardClass}>{cardBody}</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          <div className="pl-8 pb-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">More to be added soon.</p>
            <p className="text-[0.65rem] uppercase tracking-widest text-zinc-300 dark:text-zinc-700">
              End of projects
            </p>
          </div>
        </div>
      </main>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          style={{ opacity: modalVisible ? 1 : 0, transition: 'opacity 250ms ease' }}
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
            style={{ transform: modalVisible ? 'scale(1)' : 'scale(0.96)', transition: 'transform 250ms ease, opacity 250ms ease', opacity: modalVisible ? 1 : 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">{selected.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex-shrink-0 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLE[selected.status]}`}>
                  {STATUS_LABEL[selected.status] ?? selected.status}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-600">{selected.date}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {selected.tags.map(tag => (
                  <span key={tag} className="text-[0.65rem] uppercase tracking-wide px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>

              {selected.images.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-5 items-start">
                  {selected.images.map((src, i) => (
                    <div
                      key={i}
                      className="w-full sm:flex-1 sm:min-w-0 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800"
                      style={{ aspectRatio: shotRatios[src] ?? '16/9' }}
                    >
                      <img
                        src={src}
                        alt={`${selected.title} photo ${i + 1}`}
                        loading="lazy"
                        onClick={() => setZoomed(src)}
                        className="w-full h-full object-cover photo-smooth cursor-zoom-in"
                        onLoad={e => {
                          const { naturalWidth: w, naturalHeight: h } = e.currentTarget
                          if (w && h) setShotRatios(r => (r[src] ? r : { ...r, [src]: `${w}/${h}` }))
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">{selected.fullDesc}</p>

              {(selected.repoUrl || selected.liveUrl) && (
                <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  {selected.repoUrl && (
                    <a href={selected.repoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013.01-.4c1.02 0 2.05.14 3.01.4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      Repository
                    </a>
                  )}
                  {selected.liveUrl && (
                    <a href={selected.liveUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Live
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enlarged photo, over the project modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-6 sm:p-10 cursor-zoom-out"
          style={{ opacity: zoomVisible ? 1 : 0, transition: 'opacity 250ms ease' }}
          onClick={closeZoom}
        >
          <img
            src={zoomed}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl photo-smooth"
            style={{
              transform: zoomVisible ? 'scale(1)' : 'scale(0.96)',
              transition: 'transform 250ms ease, opacity 250ms ease',
              opacity: zoomVisible ? 1 : 0,
            }}
          />
          <button
            onClick={closeZoom}
            aria-label="Close photo"
            className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}
