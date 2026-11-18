import { Link, useParams } from 'react-router-dom'
import { PROJECTS, STATUS_LABEL, TitleWithIcon } from './Projects'
import { postBySlug } from '../posts'

function BackLink() {
  return (
    <Link
      to="/projects"
      className="group inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="group-hover:-translate-x-0.5 transition-transform">
        <line x1="20" y1="12" x2="4" y2="12" /><polyline points="10 6 4 12 10 18" />
      </svg>
      All projects
    </Link>
  )
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-current text-zinc-900 dark:text-zinc-100">
      {children}
    </a>
  )
}

export default function ProjectPost() {
  const { slug = '' } = useParams()
  const post = postBySlug(slug)
  const project = post && PROJECTS.find(p => p.id === post.projectId)

  if (!post || !project) {
    return (
      <main className="frame pt-14 pb-20 sm:pt-20">
        <BackLink />
        <p className="mt-8 text-zinc-500 dark:text-zinc-400">That project post doesn’t exist.</p>
      </main>
    )
  }

  const { Body } = post

  return (
    <main className="frame pt-10 pb-20 sm:pt-14">
      <BackLink />

      <header className="mt-10 mb-12 pb-10 border-b border-zinc-900 dark:border-zinc-100">
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-zinc-900 dark:text-zinc-100 max-w-[18ch] text-balance">
          <TitleWithIcon title={project.title} icon={project.icon} size="h-[0.8em]" />
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">{project.shortDesc}</p>

        <dl className="mt-8 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-12 gap-y-4 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{STATUS_LABEL[project.status]}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Date</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100 tabular-nums">{project.date}</dd>
          </div>
          <div className="col-span-2 sm:max-w-[40ch]">
            <dt className="text-zinc-500 dark:text-zinc-400">Built with</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{project.tags.join(', ')}</dd>
          </div>
          {(project.repoUrl || project.liveUrl) && (
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Links</dt>
              <dd className="mt-0.5 flex gap-4">
                {project.repoUrl && <ExternalLink href={project.repoUrl}>Repository</ExternalLink>}
                {project.liveUrl && <ExternalLink href={project.liveUrl}>Live site</ExternalLink>}
              </dd>
            </div>
          )}
        </dl>
      </header>

      {/* Post bodies are plain <h2>/<p>/<ul> — styled here so each post file
          stays just content. From lg up the page splits a third / two thirds:
          each section's heading sits in the left column, level with its first
          paragraph, and the text and figures fill the right. */}
      <article className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-12
        lg:[&>*]:col-start-2 lg:[&>h2]:col-start-1 lg:[&>h2]:mb-0 lg:[&>h2+*]:mt-14
        text-[1.05rem] lg:text-[1.15rem] leading-relaxed text-zinc-700 dark:text-zinc-300
        [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:tracking-tight [&_h2]:text-zinc-900 dark:[&_h2]:text-zinc-100 [&_h2]:mt-14 [&_h2]:mb-4
        [&_p]:mb-5
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-5 [&_li]:mb-1.5 [&_li]:marker:text-zinc-400
        [&_a]:underline [&_a]:decoration-zinc-400 hover:[&_a]:decoration-current hover:[&_a]:text-zinc-900 dark:hover:[&_a]:text-zinc-100
        [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:px-1 [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800">
        <Body />
      </article>

      <div className="mt-16 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <BackLink />
      </div>
    </main>
  )
}
