// Build-time only: renders a page of the site to an HTML string. The SSR build
// (`vite build --ssr`) bundles this, and scripts/prerender.mjs calls it once
// per path to write docs/<path>/index.html.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'

export { SITE, routeMeta, prerenderPaths } from './lib/site'

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  )
}
