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
  /** The term under way right now; labeled "In progress". */
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
    <main className="frame pt-14 pb-20 sm:pt-20">
      <header className="mb-12 sm:mb-16">
        <h1 className="font-serif text-5xl sm:text-6xl tracking-tight text-zinc-900 dark:text-zinc-100">Coursework</h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">EECS courses at the University of Michigan.</p>
      </header>

      {TERMS.map(({ term, current, courses }) => (
        <section key={term} className="border-t border-zinc-900 dark:border-zinc-100 pt-5 pb-12 md:grid md:grid-cols-[9rem_minmax(0,1fr)] md:gap-10">
          <div className="mb-4 md:mb-0 md:sticky md:top-20 md:self-start">
            <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">{term}</h2>
            {current && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">In progress</p>}
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {courses.map(course => (
              <div
                key={course.code}
                id={courseAnchor(course.code)}
                className="scroll-mt-20 py-6 first:pt-1 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-6"
              >
                <p className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400 pt-0.5 mb-1 sm:mb-0">{course.code}</p>
                <div className="max-w-[62ch]">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{course.name}</h3>
                  <p className="mt-1.5 text-zinc-600 dark:text-zinc-400 leading-relaxed">{course.desc}</p>
                  {course.projects && (
                    <>
                      <h4 className="mt-6 mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">Course projects</h4>
                      <ul className="flex flex-col gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-4">
                        {course.projects.map(proj => (
                          <li key={proj.name} className="leading-relaxed">
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{proj.name}</span>
                            {proj.who && <span className="text-sm text-zinc-500 dark:text-zinc-400">, {proj.who.toLowerCase()}</span>}
                            <span className="block text-zinc-600 dark:text-zinc-400">{proj.desc}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{PRIVATE_CODE_NOTE}.</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
