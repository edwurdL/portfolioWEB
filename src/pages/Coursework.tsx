interface Course {
  code: string
  name: string
  desc: string
}

interface Term {
  term: string
  planned?: boolean
  courses: Course[]
}

// Reverse-chronological: upcoming term first, then most recent completed.
const TERMS: Term[] = [
  {
    term: 'Fall 2026',
    planned: true,
    courses: [
      { code: 'EECS 485', name: 'Web Systems', desc: 'Design and implementation of scalable web applications, covering the full stack from front-end interfaces to distributed back-end services, caching, and information retrieval.' },
    ],
  },
  {
    term: 'Winter 2026',
    courses: [
      { code: 'EECS 482', name: 'Introduction to Operating Systems', desc: 'Core operating system concepts including thread scheduling and synchronization, virtual memory, file systems, and the fundamentals of distributed systems.' },
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
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-500">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100 mb-1">Coursework</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Computer engineering courses at the University of Michigan, term by term.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {TERMS.map(({ term, planned, courses }) => (
            <section key={term}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  {term}
                </h2>
                {planned && (
                  <span className="text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                    Upcoming
                  </span>
                )}
              </div>
              <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 border-y border-zinc-100 dark:border-zinc-800">
                {courses.map(course => (
                  <div key={course.code} className="flex gap-4 py-4">
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
