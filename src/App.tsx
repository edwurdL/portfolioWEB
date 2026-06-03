import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Photos from './pages/Photos'
import Coursework from './pages/Coursework'
import ThemeToggle from './components/ThemeToggle'
import ScrollToTop from './components/ScrollToTop'

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
          requestAnimationFrame(() => setFading(false))
        }
      }}
    >
      <Routes location={displayLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/coursework" element={<Coursework />} />
      </Routes>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = saved !== null ? saved === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  return (
    <HashRouter>
      <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 min-h-screen font-sans transition-colors duration-500">
        <AnimatedRoutes />
        <ScrollToTop />
        <ThemeToggle />
      </div>
    </HashRouter>
  )
}
