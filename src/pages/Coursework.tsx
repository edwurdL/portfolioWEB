import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface Course {
  code: string
  name: string
  desc: string
  /**
   * Assignments from the course, listed under it. `who` is shown beside the
   * name, e.g. 'Individual' or 'Team of 3'.
   */
  projects?: { name: string; who?: string; desc: string }[]
}

/** Shown under every course's project list: why there are no repo links. */
export const PRIVATE_CODE_NOTE = 'Code private per course policy'

/** The page anchor for a course, e.g. 'EECS 482' → 'eecs-482'. */
export const courseAnchor = (code: string) => code.toLowerCase().replace(/\s+/g, '-')

interface Term {
  term: string
  /** The term under way right now; labelled "In progress". */
  current?: boolean
  courses: Course[]
}

// Reverse-chronological: the current term first, then most recent completed.
export const TERMS: Term[] = [
  {
    term: 'Fall 2026',
    current: true,
    courses: [
      {
        code: 'EECS 491',
        name: 'Introduction to Distributed Systems',
        desc: 'Principles behind systems that span many machines: remote procedure calls, concurrency and consistency models, replication, fault tolerance, and consensus.',
        // Oldest first, the order they were assigned. All in Go, each building
        // on the last.
        projects: [
          { name: 'Simple Key/Value Store', desc: 'A linearizable key/value server and client with exactly-once writes across client retries, able to serve reads while a write is still going to disk, synchronized with nothing but unbuffered channels.' },
          { name: 'Primary/Backup Key/Value Service', desc: 'A view service that picks the primary and backup, and a replicated key/value service that forwards every operation to the backup, transfers state to a new backup on failover, and prevents split brain under network partitions.' },
          { name: 'Paxos-based Key/Value Service', desc: 'A Paxos library running many agreement instances concurrently, a replicated log built on it, and a key/value service that keeps working as long as a majority of replicas can reach each other.' },
        ],
      },
    ],
  },
  {
    term: 'Winter 2026',
    courses: [
      {
        code: 'EECS 482',
        name: 'Introduction to Operating Systems',
        desc: 'Core operating system concepts including thread scheduling and synchronization, virtual memory, file systems, and the fundamentals of distributed systems.',
        // Oldest first, the order they were assigned. All in C++, written from
        // the course's project specs.
        projects: [
          { name: 'Multithreaded Pizza Delivery Matching', who: 'Individual', desc: 'A concurrent program in which every driver and customer is its own thread. Each request is matched only with a driver that is among the closest to it, and vice versa, while any number of drivers drive at once. Synchronized with mutexes and condition variables alone.' },
          { name: 'Thread Library', who: 'Team of 3', desc: 'The thread library Project 1 ran on: threads, mutexes, and condition variables built on raw execution contexts, with FIFO scheduling, preemption by timer interrupts, and errors raised for misuse. Shipped with a test suite graded on how many deliberately buggy libraries it caught.' },
          { name: 'Virtual Memory Pager', who: 'Team of 3', desc: 'The part of the kernel that manages processes’ address spaces: swap-backed and file-backed pages, clock (second-chance) eviction, copy-on-write sharing across fork, and a pinned zero page, all designed to put off or avoid disk I/O and page copies.' },
          { name: 'Network File Server', who: 'Team of 3', desc: 'A multithreaded file server that takes requests over TCP sockets and stores a hierarchical file system of inodes and directory entries. Per-file reader/writer locks with hand-over-hand locking let safe requests run in parallel, disk writes are ordered so a crash never corrupts the file system, and untrusted requests are parsed defensively.' },
        ],
      },
    ],
  },
  {
    term: 'Fall 2025',
    courses: [
      { code: 'EECS 270', name: 'Introduction to Logic Design', desc: 'Boolean algebra and digital logic, from combinational circuits through sequential logic and finite state machines, with hands-on design of hardware building blocks.' },
    ],
  },
  {
    term: 'Winter 2025',
    courses: [
      { code: 'EECS 370', name: 'Introduction to Computer Organization', desc: 'How processors work beneath the code: instruction set architecture, assembly, pipelining, memory hierarchy and caches, and virtual memory.' },
      { code: 'EECS 281', name: 'Data Structures and Algorithms', desc: 'Analysis and implementation of fundamental data structures and algorithms, including trees, hash tables, and graphs, with an emphasis on asymptotic complexity and algorithmic paradigms.' },
    ],
  },
  {
    term: 'Fall 2024',
    courses: [
      { code: 'EECS 280', name: 'Programming and Intro Data Structures', desc: 'Intermediate programming in C++ with a focus on abstraction, recursion, dynamic memory management, and building containers and abstract data types from the ground up.' },
      { code: 'EECS 203', name: 'Discrete Mathematics', desc: 'Mathematical foundations for computer science: propositional logic and proof techniques, set theory, combinatorics, recursion, and an introduction to graph theory.' },
    ],
  },
]

export default function Coursework() {
  const { hash } = useLocation()

  // Arriving from a link like /coursework#eecs-482 (the Projects page's 482
  // card), bring that course into view.
  useEffect(() => {
    if (!hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-500">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100 mb-1">Coursework</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            EECS courses at the University of Michigan.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {TERMS.map(({ term, current, courses }) => (
            <section key={term}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  {term}
                </h2>
                {current && (
                  <span className="text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                    In progress
                  </span>
                )}
              </div>
              <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 border-y border-zinc-100 dark:border-zinc-800">
                {courses.map(course => (
                  <div key={course.code} id={courseAnchor(course.code)} className="scroll-mt-20 flex gap-4 py-4">
                    <p className="w-24 flex-shrink-0 font-mono text-xs text-zinc-400 dark:text-zinc-500 pt-0.5">
                      {course.code}
                    </p>
                    <div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-0.5">
                        {course.name}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {course.desc}
                      </p>
                      {course.projects && (
                        <div className="mt-3">
                          <p className="text-[0.6rem] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                            Projects
                          </p>
                          <ul className="flex flex-col gap-2">
                            {course.projects.map(proj => (
                              <li key={proj.name} className="text-sm leading-relaxed">
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{proj.name}</span>
                                {proj.who && (
                                  <span className="text-xs text-zinc-400 dark:text-zinc-500"> · {proj.who}</span>
                                )}
                                <span className="text-zinc-500 dark:text-zinc-400"> — {proj.desc}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{PRIVATE_CODE_NOTE}.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
