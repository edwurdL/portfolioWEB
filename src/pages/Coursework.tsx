interface Course {
  code: string
  name: string
  desc: string
}

const TERMS: { term: string; courses: Course[] }[] = [
  {
    term: 'Winter 2026',
    courses: [
      { code: 'EECS 482', name: 'Introduction to Operating Systems', desc: 'Multithreading, virtual memory, file systems, and distributed systems.' },
      { code: 'EECS 445', name: 'Introduction to Machine Learning', desc: 'Supervised and unsupervised learning, kernels, and neural networks.' },
    ],
  },
  {
    term: 'Fall 2025',
    courses: [
      { code: 'EECS 370', name: 'Introduction to Computer Organization', desc: 'ISA design, pipelining, caches, and virtual memory.' },
      { code: 'EECS 376', name: 'Foundations of Computer Science', desc: 'Computability, complexity, randomness, and cryptography.' },
    ],
  },
  {
    term: 'Winter 2025',
    courses: [
      { code: 'EECS 281', name: 'Data Structures and Algorithms', desc: 'Algorithm analysis, trees, hashing, graphs, and dynamic programming.' },
      { code: 'MATH 214', name: 'Applied Linear Algebra', desc: 'Vector spaces, eigenvalues, and orthogonality with applications.' },
    ],
  },
  {
    term: 'Fall 2024',
    courses: [
      { code: 'EECS 280', name: 'Programming and Intro Data Structures', desc: 'C++ programming, abstraction, containers, and dynamic memory.' },
      { code: 'EECS 203', name: 'Discrete Mathematics', desc: 'Logic, proofs, combinatorics, and graph theory.' },
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
            Classes I’ve taken at the University of Michigan, term by term.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {TERMS.map(({ term, courses }) => (
            <section key={term}>
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
                {term}
              </h2>
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
