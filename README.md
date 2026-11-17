# eddie-lai.com

Personal portfolio site — projects, a photo gallery, and coursework — built with React and
Tailwind, built and served by Cloudflare Pages, and backed by a self-hosted API for photos, projects,
and traffic analytics.

**Live:** [eddie-lai.com](https://eddie-lai.com)

## System

![UML deployment diagram: the site on Cloudflare Pages and the Express API on a Mac mini, reached through a Cloudflare Tunnel](diagrams/deployment.svg)

The site is a single-page app whose pages are also prerendered to static HTML at build time,
so link previews and crawlers see real content without running JavaScript. Everything it
renders is either compiled into the bundle or fetched at runtime from `api.eddie-lai.com`:

| Source | What comes from it |
| --- | --- |
| Bundle | Bio, project list, coursework, project photos |
| `GET /api/photos` | Gallery photos with EXIF metadata, category, and prominent colors |
| `GET /api/projects` | Project records (the page currently renders a local list) |
| `GET /api/analytics` | Last-24h unique visitors, requests, and bandwidth, proxied from Cloudflare |

The API is an Express server on a Mac mini, reached through a Cloudflare Tunnel and fronted
by Cloudflare for caching and traffic stats. Photo and analytics calls fail soft: the gallery
falls back to a built-in mock set so the page still renders, and the analytics tiles show `—`.

Each photo is a row of a Prisma model in PostgreSQL; `mapPhoto()` in `src/lib/api.ts` turns
the API's JSON into the site's own types:

![UML class diagram: the Photo model in PostgreSQL and the types the site maps it into](diagrams/photo-model.svg)

### The photo API (separate repository)

The API deploys itself the same way the site does: a GitHub Actions workflow on every push to
`main` SSHes into the Mac mini through Cloudflare Access, then pulls, builds, migrates, and
reloads the server under pm2.

![UML activity diagram: how a push to the API repository redeploys the server on the Mac mini](diagrams/api-deploy.svg)

New photos are copied from a laptop to the Mac mini over Tailscale. A chokidar watcher queues
each finished JPEG, and `processPhoto` turns them, one at a time, into a WebP and a database
row:

![UML sequence diagram: sending photos from a laptop to the Mac mini over Tailscale and processing each one](diagrams/photo-pipeline.svg)

## Stack

- **React 19** + **TypeScript**, bundled by **Vite 8**
- **Tailwind CSS v4** via `@tailwindcss/vite`, dark mode on a `.dark` class with animated
  color transitions
- **React Router 7** with normal URLs (`/projects/…`). Each route is prerendered to its own `docs/<path>/index.html`; old
  `#/` links are redirected on load
- No UI or state libraries — components, hooks, and CSS only

## Running locally

```sh
npm install
npm run dev      # vite dev server
npm run build    # tsc, vite build → docs/, then prerender every page (scripts/prerender.mjs)
npm run preview  # serve the built output
npm run diagrams # re-export the UML diagrams in diagrams/ after editing them
```

Requires Node 20+. The API base URL defaults to `https://api.eddie-lai.com` and can be
pointed elsewhere with `VITE_API_URL` in a `.env.local`:

```sh
VITE_API_URL=http://localhost:8080
```

Without it, photo requests from `localhost` are blocked by CORS and the gallery shows its
mock set — expected during local development.

## Deploying

Pushing to the `portfolio-web` repository on GitHub deploys the site: Cloudflare Pages detects
the push, runs `pnpm build`, and deploys the output to Cloudflare's CDN, which serves
eddie-lai.com. The build writes to `docs/`: the app, one prerendered HTML file per page,
`404.html`, `sitemap.xml` and `robots.txt`.

![UML activity diagram: how a push to GitHub becomes the live site](diagrams/site-deploy.svg)

## Layout

```
src/
  pages/        Home, Projects, Photos, Coursework
  components/   Header, ThemeToggle, ScrollToTop
  posts/        Project write-ups that open as their own page (registered in posts/index.ts)
  lib/          api.ts (fetch layer), site.ts (name, summary, per-page titles for link
                previews), favicon.ts (theme-aware monogram)
  types/        Shared Project / Photo types and their factories
  assets/
    projects/   Per-project photo folders — see assets/projects/README.md
  entry-server.tsx  Build-time renderer used by scripts/prerender.mjs
scripts/        prerender.mjs (runs in the build), og-image.mjs (renders public/og-image.png),
                export-diagrams.mjs (writes diagrams/)
diagrams/       The UML diagrams above, as SVG, exported from src/posts/diagrams.tsx
aboutme.txt     Home page bio, imported raw; blank lines separate paragraphs
docs/           Build output (what Cloudflare Pages deploys)
```

### Editing content

- **Bio** — edit `aboutme.txt` and rebuild.
- **Projects** — the `PROJECTS` array in `src/pages/Projects.tsx`, newest first.
- **Coursework** — the `TERMS` array in `src/pages/Coursework.tsx`, newest term first.
- **Project photos** — drop up to two images into `src/assets/projects/<project>/`; they are
  picked up automatically. Details in [`src/assets/projects/README.md`](src/assets/projects/README.md).
- **Gallery photos** — uploaded to the API, not this repo.
- **Diagrams** — the UML diagrams live in `src/posts/diagrams.tsx` and appear in the
  "How this website works" post; after editing them, run `npm run diagrams` to refresh the
  SVG copies in `diagrams/` that this README shows.
- **Link previews** — name, one-line summary and per-page titles live in `src/lib/site.ts`.
  The preview image is `public/og-image.png`; after changing the headshot or summary, rerun
  `node scripts/og-image.mjs` (needs a Chrome or Chromium binary).

## Notes

- Images are WebP, sized to roughly 2–3× their rendered box so the browser isn't downscaling
  from something huge.
- Project photos render at their natural aspect ratio and open full-screen on click.
- The favicon is generated at runtime as an SVG data URI and re-rendered when the theme
  changes.
