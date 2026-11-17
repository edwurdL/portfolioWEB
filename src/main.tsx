import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './style.css'
import App from './App'

// The site used to route with #/ hashes (eddie-lai.com/#/projects). Links
// shared from that era still work: move the hash path into the real path
// before the router reads it.
if (window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1))
}

// The page arrives prerendered (scripts/prerender.mjs) so link previews and
// crawlers see real content. Pieces of it are random or depend on this
// browser (shuffled previews, saved theme, window width), so rather than
// hydrate and reconcile the differences, the client renders fresh over it.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
