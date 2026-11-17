import { useEffect, useState } from 'react'
import {
  ApiDeployDiagram,
  DeployPipelineDiagram,
  PhotoModelDiagram,
  PhotoPipelineDiagram,
  SiteDeploymentDiagram,
} from './diagrams'
import { fetchAnalytics } from '../lib/api'
import type { SiteAnalytics } from '../types'

export default function PortfolioWebsite() {
  return (
    <>
      <p>
        This site is a personal portfolio I built from scratch with React 19, Tailwind CSS v4, and Vite.
        Its photos come from a Mac mini I run as a server, which exposes a REST API for photos and
        projects and sits behind Cloudflare for caching and traffic analytics.
      </p>

      <h2>The site</h2>
      <p>
        {/* TODO: anything you'd like to call out about the front end. */}
        The front end is responsive, with dark mode and animated theme transitions, fades between
        pages, and a filterable masonry photo gallery. Every page is also prerendered to plain HTML when
        the site is built, so link previews and search engines see the real content without having to
        run any JavaScript.
      </p>
      <p>
        Deploying is automatic. When I push to the portfolio-web repository on GitHub, Cloudflare Pages
        picks up the push, runs <code>pnpm build</code> (which type-checks the code, bundles it with Vite
        and prerenders every page), and deploys the result to Cloudflare’s CDN, which serves
        eddie-lai.com worldwide.
      </p>

      <DeployPipelineDiagram />

      <h2>The server and photo API</h2>
      <p>
        The API is an Express server on my Mac mini. Cloudflare reaches it through a Cloudflare Tunnel:
        cloudflared on the Mac mini opens the connection outward, so the Mac mini doesn’t need any open
        ports. Each photo comes back with its full EXIF metadata (camera, lens, focal length, aperture,
        shutter speed and ISO), along with a category, tags, and its most prominent colors, which the
        gallery’s category and color filters use. The metadata lives in PostgreSQL, which Express reads
        through Prisma.
      </p>
      <p>
        The API is rate-limited to 100 requests per 15 minutes per client and only accepts browser
        requests from this site. The processed images are served with a one-year cache lifetime, so
        Cloudflare can answer repeat requests for them from its cache instead of the Mac mini.
      </p>

      <SiteDeploymentDiagram />

      <p>
        Each photo is one row of a Prisma model in PostgreSQL. The API returns those rows as JSON, and
        the site maps each one into its own, slightly different shape for the gallery to use.
      </p>

      <PhotoModelDiagram />

      <p>
        The API deploys itself too. Its repository has a GitHub Actions workflow that runs on every push
        to <code>main</code>: the runner installs cloudflared and connects over SSH to
        <code>ssh.eddie-lai.com</code> through Cloudflare Access. On the Mac mini it pulls the new code, installs dependencies, builds, runs the database
        migrations, and reloads the server under pm2, which keeps it running.
      </p>

      <ApiDeployDiagram />

      <h2>Adding photos</h2>
      <p>
        To add photos, I copy the originals from my laptop to the Mac mini with rsync or scp over SSH,
        using the Mac mini’s address on my Tailscale network rather than the public internet. They land
        in <code>~/photos/unprocessed</code>, which a chokidar watcher keeps an eye on. Once a new
        <code>.jpg</code> or <code>.jpeg</code> has stopped changing for two seconds, so it’s finished
        copying, the watcher adds it to a queue, and <code>processPhoto</code> works through the queue one
        photo at a time, turning each into a gallery entry:
      </p>
      <ul>
        <li>It skips any photo that’s already in the database, deleting the duplicate original.</li>
        <li>It reads the EXIF data with exifr.</li>
        <li>It finds the five most common colors with sharp, which feed the gallery’s color filter.</li>
        <li>
          It asks the llava model, running in Ollama on the Mac mini, for a one-sentence description, a
          category and five tags.
        </li>
        <li>
          It encodes a WebP of at most 350 KB. Instead of a fixed quality, it binary-searches qualities
          from 40 to 90 for the highest one that fits, and if even the lowest is too big, it shrinks the
          image by a quarter and tries again. Widths are capped at 2,560 pixels.
        </li>
        <li>It deletes the original and saves the photo’s row to PostgreSQL.</li>
      </ul>

      <PhotoPipelineDiagram />

      <h2>Live site analytics</h2>
      <p>
        The server also passes along Cloudflare’s traffic numbers for this site. These are live, for
        the last 24 hours:
      </p>
      <SiteAnalyticsTiles />
    </>
  )
}

function SiteAnalyticsTiles() {
  const [stats, setStats] = useState<SiteAnalytics | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchAnalytics().then(setStats).catch(() => setFailed(true))
  }, [])

  const fmt = (n?: number) => (n === undefined ? '—' : n.toLocaleString())

  return (
    // Plain <div>s throughout: the post's article styles add spacing to every <p>.
    <div className="my-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile label="Unique visitors" value={fmt(stats?.uniqueVisitors)} />
        <StatTile label="Requests" value={fmt(stats?.totalRequests)} />
        <StatTile label="Bandwidth" value={formatBytes(stats?.totalBytes)} />
      </div>
      <div className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
        {failed ? 'The analytics endpoint couldn’t be reached just now.' : 'Last 24 hours · Cloudflare'}
      </div>
    </div>
  )
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${i === 0 ? v : v >= 100 ? v.toFixed(0) : v.toFixed(1)} ${units[i]}`
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-5 py-4">
      <div className="text-[0.65rem] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mb-1.5">
        {label}
      </div>
      <div className="text-2xl font-light text-zinc-800 dark:text-zinc-200 tabular-nums">{value}</div>
    </div>
  )
}
