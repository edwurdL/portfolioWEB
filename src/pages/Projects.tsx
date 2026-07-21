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
  { id:'1',  title:'Portfolio Website',          date:'Jun 2026', shortDesc:'Personal portfolio built with React, Tailwind, and Vite. Features dark mode, page transitions, and a GitHub activity calendar.',                                                              fullDesc:'A fully responsive personal portfolio site built from scratch using React 19, Tailwind CSS v4, and Vite. Features include smooth dark/light mode transitions with a custom glitch animation on the GitHub commit calendar, SPA routing via React Router, a masonry photo gallery with metadata overlays, and a mobile-responsive layout driven by a device scale hook. Deployed to GitHub Pages via a /docs build target.',                                                                              tags:['React','TypeScript','Tailwind','Vite'],            status:'in-progress', repoUrl:'https://github.com/edwurdL/eddieLaiPortfolio', liveUrl:'' },
  { id:'2',  title:'ML Image Classifier',         date:'Apr 2026', shortDesc:'Convolutional neural network trained on CIFAR-10. Achieved 91% test accuracy using PyTorch with data augmentation.',                                                                           fullDesc:'Built and trained a CNN from scratch using PyTorch on the CIFAR-10 dataset. Experimented with residual connections, batch normalization, and dropout regularization. Applied random cropping, horizontal flips, and color jitter for data augmentation. Achieved 91.3% test accuracy after 50 epochs on a single GPU. Training pipeline includes LR scheduling with cosine annealing.',                                                                                                              tags:['Python','PyTorch','CNN','CIFAR-10'],               status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'3',  title:'Distributed Key-Value Store', date:'Mar 2026', shortDesc:'A fault-tolerant distributed KV store implementing the Raft consensus algorithm in Go.',                                                                                                        fullDesc:'Implemented a distributed key-value store with linearizable reads and writes using the Raft consensus protocol. Written in Go with gRPC for RPC. Handles leader election, log replication, and snapshotting. Tested against a Jepsen-style network partition simulator. Supports concurrent client operations with at-most-once semantics via request deduplication.',                                                                                                                            tags:['Go','Raft','gRPC','Distributed Systems'],          status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'4',  title:'Compiler for Tiger Language',  date:'Jan 2026', shortDesc:'A complete compiler for the Tiger language targeting x86-64 assembly, written in OCaml.',                                                                                                      fullDesc:'Built a full compiler pipeline for the Tiger language (from Appel\'s "Modern Compiler Implementation") including lexing, parsing, semantic analysis, IR generation, register allocation via graph coloring, and x86-64 code generation. Written in OCaml. Passes all reference test cases including nested function calls and proper tail-call optimization.',                                                                                                                                   tags:['OCaml','Compilers','x86-64','Tiger'],              status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'5',  title:'Real-Time Chat App',           date:'Nov 2025', shortDesc:'WebSocket-based chat application with rooms, typing indicators, and message history persistence.',                                                                                              fullDesc:'Full-stack real-time chat app using Socket.IO, Express, React, and PostgreSQL. Supports multiple chat rooms, user presence detection, typing indicators, and scrollback history loaded via cursor-based pagination. Messages are stored in Postgres and fetched on room join. Authentication via JWT stored in httpOnly cookies.',                                                                                                                                                              tags:['React','Node.js','Socket.IO','PostgreSQL'],        status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'6',  title:'CLI Task Manager',             date:'Sep 2025', shortDesc:'A terminal-based task manager with projects, priorities, and due dates, written in Rust.',                                                                                                      fullDesc:'A fast CLI productivity tool built in Rust. Stores tasks in a local SQLite database via rusqlite. Supports nested projects, priority levels, due dates, and fuzzy search. Outputs styled tables using tui-rs. Commands follow a git-style subcommand pattern. Includes shell completion scripts for zsh and bash.',                                                                                                                                                                         tags:['Rust','CLI','SQLite','TUI'],                       status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'7',  title:'Data Viz Dashboard',           date:'Jul 2025', shortDesc:'Interactive dashboard visualizing U.S. census data using D3.js with brushing and linked views.',                                                                                                fullDesc:'Built an interactive data visualization dashboard using D3.js and vanilla TypeScript. Displays U.S. census demographic data across multiple linked views: a choropleth map, scatter plot, bar chart, and histogram. Implements brushing and linking so selections in one view filter all others. Data is loaded from CSV and processed client-side. Deployed as a static site on Netlify.',                                                                                                          tags:['D3.js','TypeScript','Data Viz','CSS'],             status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'8',  title:'Unix Shell',                   date:'May 2025', shortDesc:'A POSIX-compatible shell supporting pipes, redirection, background jobs, and signal handling.',                                                                                                 fullDesc:'Implemented a POSIX-compatible Unix shell in C from scratch. Supports command parsing with a recursive-descent parser, pipes, I/O redirection, background job control (&), signal handling (SIGCHLD, SIGINT, SIGTSTP), and built-in commands (cd, fg, bg, jobs, exit). Handles quoted strings and escape sequences correctly.',                                                                                                                                                                  tags:['C','Unix','Systems Programming','POSIX'],          status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'9',  title:'iOS Habit Tracker',            date:'Mar 2025', shortDesc:'A SwiftUI habit tracking app with streak tracking, reminders, and a contribution-style heatmap.',                                                                                               fullDesc:'Native iOS app built with SwiftUI and Core Data. Users can create habits, set daily/weekly targets, and receive local push notifications as reminders. Progress is displayed on a GitHub-style contribution heatmap. App supports iCloud sync via CloudKit. Submitted to the App Store as a student project.',                                                                                                                                                                                tags:['Swift','SwiftUI','Core Data','iOS'],               status:'archived',    repoUrl:'', liveUrl:'' },
  { id:'10', title:'Pathfinding Visualizer',       date:'Jan 2025', shortDesc:'Visual comparison of BFS, DFS, Dijkstra, and A* on a grid with real-time animation.',                                                                                                          fullDesc:'A web-based pathfinding algorithm visualizer built with React. Users can draw walls, place start/end nodes, and run BFS, DFS, Dijkstra\'s algorithm, or A* with various heuristics. The grid animates visited cells and the shortest path in real-time. Supports weighted grids and diagonal movement. Built to help visualize CS coursework concepts.',                                                                                                                                          tags:['React','Algorithms','Visualization','TypeScript'],  status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'11', title:'Malloc Implementation',        date:'Nov 2024', shortDesc:'A dynamic memory allocator in C implementing explicit free lists and boundary tag coalescing.',                                                                                                  fullDesc:'Implemented a dynamic memory allocator (malloc, free, realloc, calloc) in C using an explicit doubly-linked free list with boundary tag coalescing and first-fit placement. Optimized for both throughput and memory utilization. Achieves ~74% memory utilization and ~9000 Kops/s on the provided trace files. Part of CMU 15-213/CSAPP.',                                                                                                                                                    tags:['C','Systems','Memory Management','CSAPP'],         status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'12', title:'Proxy Server',                 date:'Oct 2024', shortDesc:'A multithreaded HTTP proxy with an LRU cache, supporting concurrent client connections.',                                                                                                       fullDesc:'Built a concurrent HTTP/1.0 proxy server in C using POSIX threads. Implements an LRU cache using a doubly-linked list and hash map to cache recent responses. Thread safety is managed with reader-writer locks. Handles chunked transfer encoding and persistent connections. Part of CMU 15-213/CSAPP.',                                                                                                                                                                                   tags:['C','Networking','HTTP','Concurrency'],             status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'13', title:'Neural Style Transfer',        date:'Aug 2024', shortDesc:'Applies artistic styles to photos using VGG-19 feature maps and gradient descent in PyTorch.',                                                                                                  fullDesc:'Implemented Gatys et al.\'s neural style transfer algorithm using PyTorch. Uses VGG-19 feature maps to compute content loss (Frobenius norm on intermediate activations) and style loss (Gram matrix difference across multiple layers). Optimized the output image directly via L-BFGS. Supports arbitrary content/style pairs and multiple style weights.',                                                                                                                                     tags:['Python','PyTorch','Computer Vision','VGG-19'],     status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'14', title:'TCP/IP Stack',                 date:'Jun 2024', shortDesc:'Partial TCP/IP stack implementation in Python handling connection establishment and reliable delivery.',                                                                                         fullDesc:'Implemented TCP connection establishment (3-way handshake), reliable ordered delivery, flow control (receive window), and congestion control (slow start, AIMD) using raw sockets in Python. Handles out-of-order segments, duplicate ACKs, and retransmission with exponential backoff. Built for a networks course project.',                                                                                                                                                                  tags:['Python','Networking','TCP/IP','Sockets'],          status:'completed',   repoUrl:'', liveUrl:'' },
  { id:'15', title:'Game Engine Prototype',        date:'Mar 2024', shortDesc:'A minimal 2D game engine in C++ with an ECS architecture, physics, and an OpenGL renderer.',                                                                                                   fullDesc:'Built a minimal 2D game engine from scratch in C++ using an Entity-Component-System (ECS) architecture. Features an OpenGL renderer with sprite batching, a simple AABB physics engine with broad-phase detection, a scene graph, and a Lua scripting interface for game logic. Shipped a small platformer demo using the engine.',                                                                                                                                                              tags:['C++','OpenGL','ECS','Game Dev'],                   status:'archived',    repoUrl:'', liveUrl:'' },
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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-500">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100 mb-1">Projects</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Things I’ve built, newest first.</p>
        </header>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />

          {projects.map((p, i) => (
            <div
              key={p.id}
              className="relative pl-8 mb-8"
            >
              {/* Timeline dot */}
              <div className="absolute left-[-4px] top-5 w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 ring-2 ring-white dark:ring-zinc-900" />

              {/* Card */}
              <div
                onClick={() => setSelected(p)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{p.title}</h2>
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

              {/* Year marker between entries, sitting on the timeline */}
              {i < projects.length - 1 &&
                projects[i].date.split(' ')[1] !== projects[i + 1]?.date.split(' ')[1] && (
                <div className="absolute left-0 -translate-x-1/2 mt-3 px-1.5 py-0.5 bg-white dark:bg-zinc-900 text-[0.6rem] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  {projects[i + 1]?.date.split(' ')[1]}
                </div>
              )}
            </div>
          ))}

          {/* Sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {loading && (
            <div className="pl-8 pb-4 text-sm text-zinc-400 dark:text-zinc-600">Loading…</div>
          )}

          {!hasMore && !loading && (
            <div className="pl-8 pb-4 text-[0.65rem] uppercase tracking-widest text-zinc-300 dark:text-zinc-700">
              End of projects
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
