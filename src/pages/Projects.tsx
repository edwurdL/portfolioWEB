import { useEffect, useRef, useState } from 'react'
import { fetchProjects } from '../lib/api'
import { createProject } from '../types'
import type { Project, ProjectStatus } from '../types'

const STATUS_STYLE: Record<ProjectStatus, string> = {
  'completed':   'bg-green-50  dark:bg-green-900/20 text-green-700  dark:text-green-400',
  'in-progress': 'bg-blue-50   dark:bg-blue-900/20  text-blue-700   dark:text-blue-400',
  'archived':    'bg-zinc-100  dark:bg-zinc-800      text-zinc-500   dark:text-zinc-400',
}

const PAGE_SIZE = 5

const ALL_MOCK: Required<Project>[] = [
  {
    id: '1',
    title: 'Portfolio Website & Self-Hosted Server',
    date: 'Jul 2026',
    shortDesc: 'Personal portfolio built with React and Tailwind, backed by a self-hosted remote server serving a custom photo and projects API.',
    fullDesc: 'A responsive personal portfolio built from scratch with React 19, Tailwind CSS v4, and Vite — featuring dark mode with animated theme transitions, page transitions, a filterable masonry photo gallery, and live site analytics. Content is served from a self-hosted remote server exposing a REST API for photos (with full EXIF metadata) and projects, fronted by Cloudflare for caching and traffic analytics.',
    tags: ['React', 'TypeScript', 'Tailwind', 'REST API', 'Self-Hosted'],
    status: 'in-progress',
    repoUrl: 'https://github.com/edwurdL/eddieLaiPortfolio',
    liveUrl: '',
  },
  {
    id: '2',
    title: 'Medical Census Analytics Dashboard',
    date: 'Jul 2026',
    shortDesc: 'Tableau dashboard aggregating 400k+ state-wide medical census data points for high-dimensional trend analysis, with an ETL pipeline in progress.',
    fullDesc: 'Developed a medical census analytics dashboard aggregating over 400,000 state-wide data points, enabling deep trend visibility and high-dimensional analysis across demographic and geographic breakdowns. Currently building an ETL data pipeline to automate ingestion, cleaning, and transformation of incoming census data feeding the dashboard.',
    tags: ['Tableau', 'ETL', 'Data Analytics', 'Data Viz'],
    status: 'in-progress',
    repoUrl: '',
    liveUrl: '',
  },
  {
    id: '3',
    title: 'Operating System File System',
    date: 'Apr 2026',
    shortDesc: 'A UNIX-style filesystem in C++ with inodes, directory entries, and crash-consistent, atomic block allocation.',
    fullDesc: 'Built a UNIX-style filesystem in C++, implementing inodes, directory entries, and block allocation with lazy deletion to mirror real-world filesystem behavior. Engineered crash-consistent storage by leveraging atomic multi-step filesystem operations, ensuring metadata and data integrity are preserved across unexpected system failures with zero data corruption. Hardened reliability with input reconstruction-based validation — parsing and rebuilding user input to enforce strict correctness guarantees and eliminate malformed or malicious operation requests.',
    tags: ['C++', 'Operating Systems', 'Multithreading', 'Boost'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
  {
    id: '4',
    title: 'Virtual Memory Pager',
    date: 'Mar 2026',
    shortDesc: 'A demand-paging virtual memory pager for RAM using the clock eviction algorithm with deferred eviction and overwriting.',
    fullDesc: 'Built a demand-paging virtual memory pager managing physical RAM. Implemented the clock (second-chance) algorithm for page eviction, along with deferred eviction and deferred overwriting to avoid unnecessary disk writes and page copies until a page is actually modified. Handled page faults, resident and swap-backed state tracking, and reference/dirty bit management to preserve correctness under memory pressure.',
    tags: ['C++', 'Operating Systems', 'Virtual Memory', 'Paging'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
  {
    id: '5',
    title: 'CPU Scheduler',
    date: 'Feb 2026',
    shortDesc: 'A CPU scheduler handling interrupts, context switching, and mutex-based synchronization under preemption.',
    fullDesc: 'Implemented a CPU scheduler that drives process execution through interrupt handling, context switching between threads, and mutex-based synchronization. Coordinated safe access to shared kernel state and enforced correct scheduling semantics under preemption, avoiding race conditions across concurrent context swaps.',
    tags: ['C++', 'Operating Systems', 'Concurrency', 'Scheduling'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
  {
    id: '6',
    title: 'Multithreaded Pizza Delivery Matching',
    date: 'Feb 2026',
    shortDesc: 'A multithreaded order-to-driver matching simulation coordinating concurrent assignment with basic locks.',
    fullDesc: 'Built a multithreaded pizza delivery matching system that pairs incoming orders with available drivers concurrently. Used basic locks and condition variables to coordinate shared state between producer and consumer threads, preventing race conditions and deadlock while sustaining throughput under concurrent load.',
    tags: ['C++', 'Multithreading', 'Concurrency', 'Locks'],
    status: 'completed',
    repoUrl: '',
    liveUrl: '',
  },
]

export default function Projects() {
  const [projects, setProjects] = useState<Required<Project>[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Required<Project> | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // Synchronous guard: the mount effect and the IntersectionObserver can both
  // call loadMore before the `loading` state flag has flushed.
  const loadingRef = useRef(false)

  const loadMore = async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)
    try {
      const data = await fetchProjects(PAGE_SIZE, offset)
      const normalized = data.map(createProject)
      setProjects(prev => [...prev, ...normalized])
      setOffset(prev => prev + normalized.length)
      setHasMore(normalized.length === PAGE_SIZE)
    } catch {
      const slice = ALL_MOCK.slice(offset, offset + PAGE_SIZE)
      setProjects(prev => [...prev, ...slice])
      setOffset(prev => prev + slice.length)
      setHasMore(offset + PAGE_SIZE < ALL_MOCK.length)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => { loadMore() }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) loadMore() }, { threshold: 0.1, rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [offset, hasMore, loading])


  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => setModalVisible(true))
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selected])

  const closeModal = () => {
    setModalVisible(false)
    setTimeout(() => setSelected(null), 250)
  }

  // Group consecutive projects by year so the timeline can show a year header
  // (like the Coursework page). Projects are already newest-first.
  const groups: { year: string; items: Required<Project>[] }[] = []
  for (const p of projects) {
    const year = p.date.split(' ')[1] ?? '—'
    const last = groups[groups.length - 1]
    if (last && last.year === year) last.items.push(p)
    else groups.push({ year, items: [p] })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-500">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100 mb-1">Projects</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Things I’ve built, newest first.</p>
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

              {items.map(p => (
                <div key={p.id} className="relative pl-8 mb-8">
                  {/* Timeline dot */}
                  <div className="absolute left-[-4px] top-5 w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 ring-2 ring-white dark:ring-zinc-900" />

                  {/* Card */}
                  <div
                    onClick={() => setSelected(p)}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{p.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}>
                          {p.status}
                        </span>
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
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {loading && (
            <div className="pl-8 pb-4 text-sm text-zinc-400 dark:text-zinc-600">Loading…</div>
          )}

          {!hasMore && !loading && (
            <div className="pl-8 pb-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">More to be added soon.</p>
              <p className="text-[0.65rem] uppercase tracking-widest text-zinc-300 dark:text-zinc-700">
                End of projects
              </p>
            </div>
          )}
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
                  {selected.status}
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
    </div>
  )
}
