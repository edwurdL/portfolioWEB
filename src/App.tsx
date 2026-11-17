import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectPost from './pages/ProjectPost'
import Photos from './pages/Photos'
import Coursework from './pages/Coursework'
import Header from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import { watchFavicon } from './lib/favicon'
import { routeMeta } from './lib/site'

function AnimatedRoutes() {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setFading(true)
    }
  }, [location, displayLocation])

  return (
    <div
      style={{ transition: 'opacity 300ms ease' }}
      className={fading ? 'opacity-0' : 'opacity-100'}
      onTransitionEnd={(e) => {
        if (e.target !== e.currentTarget) return
        if (fading) {
          setDisplayLocation(location)
          window.scrollTo(0, 0)
          requestAnimationFrame(() => setFading(false))
        }
      }}
    >
      <Routes location={displayLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectPost />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/coursework" element={<Coursework />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100 mb-2">Page not found</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Nothing lives at this address.{' '}
        <Link to="/" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
          Go home
        </Link>
      </p>
    </main>
  )
}

/**
 * Everything inside the router. main.tsx wraps it in a BrowserRouter for the
 * live site; entry-server.tsx wraps it in a StaticRouter to prerender each
 * page to HTML at build time (see scripts/prerender.mjs).
 */
export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = saved !== null ? saved === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', dark)
    return watchFavicon()
  }, [])

  // The prerendered HTML already carries the right title; this keeps it right
  // as you move between pages without a reload.
  useEffect(() => {
    document.title = routeMeta(pathname).title
  }, [pathname])

  return (
    <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-screen font-sans transition-colors duration-500">
      <Header />
      <AnimatedRoutes />
      <ScrollToTop />
    </div>
  )
}
