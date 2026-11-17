import { Link, useParams } from 'react-router-dom'
import { PROJECTS, STATUS_LABEL, STATUS_STYLE } from './Projects'
import { postBySlug } from '../posts'

function BackLink() {
  return (
    <Link
      to="/projects"
      className="group inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
    >
      <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
      Projects
    </Link>
  )
}

export default function ProjectPost() {
  const { slug = '' } = useParams()
  const post = postBySlug(slug)
  const project = post && PROJECTS.find(p => p.id === post.projectId)

  if (!post || !project) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-500">
        <main className="max-w-3xl mx-auto px-6 py-12">
          <BackLink />
          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">That project post doesn’t exist.</p>
        </main>
      </div>
    )
  }

  const { Body } = post

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-500">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <BackLink />

        <header className="mt-8 mb-10 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLE[project.status]}`}>
              {STATUS_LABEL[project.status] ?? project.status}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-600">{project.date}</span>
          </div>

          <h1 className="font-serif text-4xl text-zinc-900 dark:text-zinc-100 mb-3">{project.title}</h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">{project.shortDesc}</p>

          <div className="flex flex-wrap items-center gap-1.5">
            {project.tags.map(tag => (
              <span key={tag} className="text-[0.65rem] uppercase tracking-wide px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                {tag}
              </span>
            ))}
          </div>

          {(project.repoUrl || project.liveUrl) && (
            <div className="flex gap-4 mt-5">
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013.01-.4c1.02 0 2.05.14 3.01.4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  Repository
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Live
                </a>
              )}
            </div>
          )}
        </header>

        {/* Post bodies are plain <h2>/<p>/<ul> — styled here so each post file
            stays just content. */}
        <article className="text-[0.95rem] leading-relaxed text-zinc-700 dark:text-zinc-300
          [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-zinc-900 dark:[&_h2]:text-zinc-100 [&_h2]:mt-10 [&_h2]:mb-3
          [&_p]:mb-4
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1
          [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-zinc-900 dark:hover:[&_a]:text-zinc-100
          [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:px-1 [&_code]:rounded [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800">
          <Body />
        </article>

        <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <BackLink />
        </div>
      </main>
    </div>
  )
}
