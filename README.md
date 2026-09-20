# eddie-lai.com

Personal portfolio site — projects, a photo gallery, and coursework — built with React and
Tailwind, served from GitHub Pages, and backed by a self-hosted API for photos, projects,
and traffic analytics.

**Live:** [eddie-lai.com](https://eddie-lai.com)

## System

<!-- System diagram goes here. -->

The site is a static single-page app. Everything it renders is either compiled into the
bundle or fetched at runtime from `api.eddie-lai.com`:

| Source | What comes from it |
| --- | --- |
| Bundle | Bio, project list, coursework, project photos |
| `GET /api/photos` | Gallery photos with EXIF metadata, category, and prominent colors |
| `GET /api/projects` | Project records (the page currently renders a local list) |
| `GET /api/analytics` | Last-24h unique visitors, requests, and bandwidth, proxied from Cloudflare |

The API is self-hosted on a remote server and fronted by Cloudflare for caching and traffic
stats. Photo and analytics calls fail soft: the gallery falls back to a built-in mock set so
the page still renders, and the analytics tiles show `—`.

## Stack

- **React 19** + **TypeScript**, bundled by **Vite 8**
- **Tailwind CSS v4** via `@tailwindcss/vite`, dark mode on a `.dark` class with animated
  color transitions
- **React Router 7** (`HashRouter`, so deep links work on GitHub Pages without a 404 shim)
- No UI or state libraries — components, hooks, and CSS only

## Running locally

```sh
npm install
npm run dev      # vite dev server
npm run build    # tsc && vite build → docs/
npm run preview  # serve the built output
```

Requires Node 20+. The API base URL defaults to `https://api.eddie-lai.com` and can be
pointed elsewhere with `VITE_API_URL` in a `.env.local`:

```sh
VITE_API_URL=http://localhost:8080
```

Without it, photo requests from `localhost` are blocked by CORS and the gallery shows its
mock set — expected during local development.

## Deploying

`npm run build` writes to `docs/`, which is what GitHub Pages serves (Settings → Pages →
branch `main`, folder `/docs`). `public/CNAME` carries the custom domain through each build.
**The built output is committed** — a change isn't live until `docs/` is rebuilt and pushed.

## Layout

```
src/
  pages/        Home, Projects, Photos, Coursework
  components/   Header, ThemeToggle, ScrollToTop
  lib/          api.ts (fetch layer), favicon.ts (theme-aware monogram)
  types/        Shared Project / Photo types and their factories
  assets/
    projects/   Per-project photo folders — see assets/projects/README.md
aboutme.txt     Home page bio, imported raw; blank lines separate paragraphs
docs/           Build output served by GitHub Pages
```

### Editing content

- **Bio** — edit `aboutme.txt` and rebuild.
- **Projects** — the `PROJECTS` array in `src/pages/Projects.tsx`, newest first.
- **Coursework** — the `TERMS` array in `src/pages/Coursework.tsx`, newest term first.
- **Project photos** — drop up to two images into `src/assets/projects/<project>/`; they are
  picked up automatically. Details in [`src/assets/projects/README.md`](src/assets/projects/README.md).
- **Gallery photos** — uploaded to the API, not this repo.

## Notes

- Images are WebP, sized to roughly 2–3× their rendered box so the browser isn't downscaling
  from something huge.
- Project photos render at their natural aspect ratio and open full-screen on click.
- The favicon is generated at runtime as an SVG data URI and re-rendered when the theme
  changes.
