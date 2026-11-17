// Renders public/og-image.png, the 1200×630 card link previews show (LinkedIn,
// Slack, iMessage, email): headshot, name and the one-line summary from
// src/lib/site.ts. Not part of the build; rerun by hand if any of those change:
//
//   node scripts/og-image.mjs [path-to-chrome]
//
// Needs a Chrome or Chromium binary. Defaults to Playwright's copy if present.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function findChrome() {
  if (process.argv[2]) return process.argv[2]
  const pw = join(homedir(), '.cache/ms-playwright')
  for (const dir of existsSync(pw) ? readdirSync(pw).filter(d => d.startsWith('chromium-')).sort().reverse() : []) {
    const bin = join(pw, dir, 'chrome-linux/chrome')
    if (existsSync(bin)) return bin
  }
  for (const bin of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) {
    if (existsSync(bin)) return bin
  }
  throw new Error('No Chrome found; pass its path as the first argument.')
}

// Pulled from site.ts by pattern rather than imported, to keep this script
// free of a TypeScript step.
const site = readFileSync(join(root, 'src/lib/site.ts'), 'utf8')
const name = site.match(/name: '([^']+)'/)[1]
const summary = site.match(/summary:\s*'([^']+)'/)[1]
const headshot = readFileSync(join(root, 'src/assets/headshot.webp')).toString('base64')

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=Instrument+Serif&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { background: #fafafa; color: #18181b; font-family: 'DM Sans', sans-serif;
         display: flex; align-items: center; gap: 64px; padding: 0 88px; box-sizing: border-box; }
  img { width: 360px; height: 360px; border-radius: 40px; object-fit: cover; flex-shrink: 0;
        border: 1px solid #e4e4e7; }
  h1 { font-family: 'Instrument Serif', serif; font-weight: 400; font-size: 104px; line-height: 1; margin: 0 0 24px; }
  p { font-size: 32px; line-height: 1.35; color: #52525b; margin: 0 0 36px; }
  .url { font-size: 24px; letter-spacing: 0.08em; text-transform: uppercase; color: #a1a1aa; }
</style></head><body>
  <img src="data:image/webp;base64,${headshot}">
  <div><h1>${name}</h1><p>${summary}</p><div class="url">eddie-lai.com</div></div>
</body></html>`

const work = mkdtempSync(join(tmpdir(), 'og-'))
const page = join(work, 'og.html')
writeFileSync(page, html)
const out = join(root, 'public/og-image.png')
execFileSync(findChrome(), [
  '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
  '--force-device-scale-factor=1', '--window-size=1200,630',
  '--virtual-time-budget=5000', `--screenshot=${out}`, `file://${page}`,
], { stdio: 'inherit' })
console.log(`wrote ${out}`)
