// Runs after both builds (see "build" in package.json). For every page of the
// site it renders the React app to HTML and writes docs/<path>/index.html, with
// that page's title, description and Open Graph tags in the <head>. Cloudflare
// Pages serves those files as-is, so link previews and crawlers that don't run
// JavaScript still see the page. Also writes 404.html (the host's fallback
// for any other path), sitemap.xml and robots.txt.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'docs')
const ssrDir = join(root, 'dist-ssr')

const { render, routeMeta, prerenderPaths, SITE } = await import(
  pathToFileURL(join(ssrDir, 'entry-server.js')).href
)

const template = await readFile(join(outDir, 'index.html'), 'utf8')
const META = /<!-- meta:start[\s\S]*?<!-- meta:end -->/
if (!META.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error('docs/index.html is missing the meta block or the empty #root to fill')
}

const esc = s =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// The host answers /projects with a redirect to /projects/, so the
// trailing-slash form is the address each page actually lives at.
const canonical = path => `${SITE.url}${path === '/' ? '/' : `${path}/`}`

function headFor(path, { indexable = true } = {}) {
  const { title, description } = routeMeta(path)
  const url = canonical(path)
  const image = `${SITE.url}${SITE.image}`
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    indexable ? `<link rel="canonical" href="${url}" />` : `<meta name="robots" content="noindex" />`,
    `<meta property="og:type" content="${path.startsWith('/projects/') ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(SITE.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n  ')
}

function page(path, opts) {
  return template
    .replace(META, () => headFor(path, opts))
    .replace('<div id="root"></div>', () => `<div id="root">${render(path)}</div>`)
}

const paths = prerenderPaths()
for (const path of paths) {
  const file = path === '/' ? join(outDir, 'index.html') : join(outDir, path, 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, page(path))
}

// Any other path: the app's own "not found" page, kept out of search results.
await writeFile(join(outDir, '404.html'), page('/404', { indexable: false }))

await writeFile(
  join(outDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(p => `  <url><loc>${canonical(p)}</loc></url>`).join('\n')}
</urlset>
`
)
await writeFile(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`)

await rm(ssrDir, { recursive: true, force: true })
console.log(`prerendered ${paths.length} pages + 404.html into docs/`)
