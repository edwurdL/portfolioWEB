// Exports the UML diagrams from the "How this website works" post
// (src/posts/diagrams.tsx) as standalone SVG files in diagrams/, for the README.
// Rerun after changing a diagram:
//
//   pnpm diagrams
//
// On the site the diagrams take their colours from the .uml rules in
// src/style.css. A standalone SVG can't see that stylesheet, so each file gets
// those rules embedded, with dark-mode colours under prefers-color-scheme and a
// solid background so it stays readable on either GitHub theme.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'diagrams')

const DIAGRAMS = [
  ['SiteDeploymentDiagram', 'deployment.svg'],
  ['DeployPipelineDiagram', 'site-deploy.svg'],
  ['PhotoModelDiagram', 'photo-model.svg'],
  ['ApiDeployDiagram', 'api-deploy.svg'],
  ['PhotoPipelineDiagram', 'photo-pipeline.svg'],
]

// The .uml rules from style.css: everything from the diagram comment onward.
const css = await readFile(join(root, 'src/style.css'), 'utf8')
const start = css.indexOf('/* UML diagrams')
if (start < 0) throw new Error('UML block not found in src/style.css')
let rules = css.slice(start)
const dark = rules.match(/html\.dark \.uml \{[^}]*\}/)
if (!dark) throw new Error('Dark-mode UML colours not found in src/style.css')
rules = rules
  .replace(dark[0], '')
  .replace('font-family: var(--font-sans);', "font-family: 'Schibsted Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif;")
const style =
  rules +
  `\n@media (prefers-color-scheme: dark) {\n  ${dark[0].replace('html.dark .uml', '.uml')}\n}\n` +
  '.uml .bg { fill: var(--uml-bg); }\n'

const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
try {
  const mod = await vite.ssrLoadModule('/src/posts/diagrams.tsx')
  await mkdir(outDir, { recursive: true })

  for (const [name, file] of DIAGRAMS) {
    const html = renderToStaticMarkup(createElement(mod[name]))
    const svg = html.match(/<svg[\s\S]*<\/svg>/)?.[0]
    if (!svg) throw new Error(`${name} rendered no <svg>`)

    const [, , , w, h] = svg.match(/viewBox="(\S+) (\S+) (\S+) (\S+)"/)
    const out = svg
      // Site-only Tailwind classes (width, scrolling) mean nothing here.
      .replace(/<svg class="[^"]*"/, `<svg xmlns="http://www.w3.org/2000/svg" class="uml" width="${w}" height="${h}"`)
      // Styles first, then a background behind everything else.
      .replace(/(<desc[\s\S]*?<\/desc>)/, `$1<style>${style}</style><rect class="bg" width="100%" height="100%"/>`)

    await writeFile(join(outDir, file), `<?xml version="1.0" encoding="UTF-8"?>\n${out}\n`)
    console.log(`wrote diagrams/${file}`)
  }
} finally {
  await vite.close()
}
