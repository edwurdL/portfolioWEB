import { PROJECTS } from '../pages/Projects'
import { POSTS, postBySlug } from '../posts'

/**
 * Who the site is about and how it introduces itself in link previews
 * (LinkedIn, Slack, iMessage, email). scripts/prerender.mjs writes these into
 * each page's <head> at build time, and App keeps document.title in step as
 * you navigate.
 */
export const SITE = {
  name: 'Eddie Lai',
  url: 'https://eddie-lai.com',
  summary:
    'Computer Engineering student at the University of Michigan. Projects in robotics, embedded systems, and software.',
  // 1200×630 card with the headshot, in public/. Regenerate with
  // `node scripts/og-image.mjs` if the photo or summary changes.
  image: '/og-image.png',
  imageAlt: 'Eddie Lai',
}

export interface RouteMeta {
  title: string
  description: string
}

const PAGES: Record<string, RouteMeta> = {
  '/':           { title: `${SITE.name} — Portfolio`,  description: SITE.summary },
  '/projects':   { title: `Projects — ${SITE.name}`,   description: 'Robotics and software projects: motion control, embedded systems, mechanical design, and operating systems.' },
  '/coursework': { title: `Coursework — ${SITE.name}`, description: 'Classes I’ve taken at the University of Michigan.' },
  '/photos':     { title: `Photos — ${SITE.name}`,     description: 'A filterable photo gallery served from my self-hosted photo API.' },
}

/** Title and description for a path; unknown paths get a not-found title. */
export function routeMeta(pathname: string): RouteMeta {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (PAGES[path]) return PAGES[path]

  const slug = path.match(/^\/projects\/([^/]+)$/)?.[1]
  const post = slug ? postBySlug(slug) : undefined
  const project = post && PROJECTS.find(p => p.id === post.projectId)
  if (project) return { title: `${project.title} — ${SITE.name}`, description: project.shortDesc }

  return { title: `Page not found — ${SITE.name}`, description: SITE.summary }
}

/** Every path that gets its own prerendered HTML file. */
export function prerenderPaths(): string[] {
  return [...Object.keys(PAGES), ...POSTS.map(p => `/projects/${p.slug}`)]
}
