import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitHubCalendar } from 'react-github-calendar'
import profileImg from '../assets/deadfile.png'
import { useDevice, DEVICE_CONFIG } from '../hooks/useDevice'

const GITHUB_USERNAME = 'edwurdL'

const SOCIALS = [
  { label: 'Gmail', href: 'mailto:edlai@umich.edu' },
  { label: 'GitHub', href: 'https://github.com/edwurdL' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
]

export default function Home() {
  const navigate = useNavigate()
  const device = useDevice()
  const cfg = DEVICE_CONFIG[device]
  const scrollRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef(0)
  const lockedRef = useRef(false)
  const [scrollY, setScrollY] = useState(0)
  const [blockSize, setBlockSize] = useState(6)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [themeT, setThemeT] = useState(() => document.documentElement.classList.contains('dark') ? 1 : 0)
  const [calScheme, setCalScheme] = useState<'light' | 'dark'>(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  const themeTRef = useRef(themeT)
  const animRef = useRef(0)

  useEffect(() => {
    const mo = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    mo.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    const target = isDark ? 1 : 0
    const startVal = themeTRef.current
    const startTime = Date.now()
    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []
    cancelAnimationFrame(animRef.current)

    const tick = () => {
      if (cancelled) return
      const t = Math.min(1, (Date.now() - startTime) / 500)
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const val = startVal + (target - startVal) * eased
      themeTRef.current = val
      setThemeT(val)
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        const targetColors = isDark
          ? ['#3f3f46', '#0e4429', '#006d32', '#26a641', '#39d353']
          : ['#d4d4d8', '#9be9a8', '#40c463', '#30a14e', '#216e39']
        const container = calendarRef.current
        const rects = container ? Array.from(container.querySelectorAll<SVGRectElement>('rect[data-level]')) : []
        const shuffled = rects.filter(r => r.dataset.level !== '0').sort(() => Math.random() - 0.5)

        if (shuffled.length === 0) { setCalScheme(isDark ? 'dark' : 'light'); return }

        const GLITCH_DELAY = 150 // ms pause before flip starts

        shuffled.forEach((rect, i) => {
          const tid = setTimeout(() => {
            if (cancelled) return
            rect.style.fill = targetColors[parseInt(rect.dataset.level ?? '0')]
            if (i === shuffled.length - 1) {
              const tid2 = setTimeout(() => {
                if (!cancelled) {
                  setCalScheme(isDark ? 'dark' : 'light')
                  setTimeout(() => rects.forEach(r => (r.style.fill = '')), 50)
                }
              }, 50)
              timeouts.push(tid2)
            }
          }, GLITCH_DELAY + i * (400 / shuffled.length))
          timeouts.push(tid)
        })
      }
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(animRef.current)
      timeouts.forEach(clearTimeout)
    }
  }, [isDark])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const progress = el.scrollTop / window.innerHeight
      setScrollY(progress)
      sectionRef.current = Math.round(progress)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = calendarRef.current
    if (!el) return
    const update = (width: number) =>
      setBlockSize(Math.max(4, Math.floor((width - 28) / 53) - 2))
    const ro = new ResizeObserver(([e]) => update(e.contentRect.width))
    ro.observe(el)
    update(el.offsetWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const goTo = (idx: number) => {
      lockedRef.current = true
      sectionRef.current = idx
      el.scrollTo({ top: idx * window.innerHeight, behavior: 'smooth' })
      setTimeout(() => { lockedRef.current = false }, 1000)
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (lockedRef.current) return
      const next = e.deltaY > 0 ? Math.min(1, sectionRef.current + 1) : Math.max(0, sectionRef.current - 1)
      if (next !== sectionRef.current) goTo(next)
    }

    let touchStartY = 0
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY }
    const onTouchEnd = (e: TouchEvent) => {
      if (lockedRef.current) return
      const delta = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(delta) < 50) return
      const next = delta > 0 ? Math.min(1, sectionRef.current + 1) : Math.max(0, sectionRef.current - 1)
      if (next !== sectionRef.current) goTo(next)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const bioOpacity = Math.max(0, 1 - scrollY * 1.8)
  const analyticsOpacity = Math.min(1, Math.max(0, (scrollY - 0.15) * 1.8))

  return (
    <div
      ref={scrollRef}
      className="h-screen overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Section 1 — Bio */}
      <section
        className="snap-start h-screen flex flex-col"
        style={{ paddingLeft: cfg.sectionPx, paddingRight: cfg.sectionPx, paddingTop: cfg.sectionPt, paddingBottom: cfg.sectionPb, opacity: bioOpacity, transition: 'opacity 0.25s ease-out' }}
      >
        <div className="flex-1 flex flex-col justify-start">
          <div className="mx-auto max-w-[110rem] flex flex-col gap-5">
            <img
              src={profileImg}
              alt="Profile"
              className="rounded-lg object-cover"
              style={{ width: cfg.profileSize, height: cfg.profileSize }}
            />

            <h1 className="font-serif text-zinc-900 dark:text-zinc-100 leading-none" style={{ fontSize: cfg.fontSize.name }}>
              Eddie
            </h1>

            <p className="text-justify text-zinc-600 dark:text-zinc-400 leading-relaxed" style={{ fontSize: cfg.fontSize.bio }}>
              Section. 1.
All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.

Section. 2.
The House of Representatives shall be composed of Members chosen every second Year by the People of the several States, and the Electors in each State shall have the Qualifications requisite for Electors of the most numerous Branch of the State Legislature.

No Person shall be a Representative who shall not have attained to the Age of twenty five Years, and been seven Years a Citizen of the United States, and who shall not, when elected, be an Inhabitant of that State in which he shall be chosen.
            </p>

            <div className="flex gap-6 justify-center">
              {SOCIALS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border-b border-transparent hover:border-zinc-400 dark:hover:border-zinc-500 pb-px"
                  style={{ fontSize: cfg.fontSize.socials }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[110rem] w-full flex mb-6" style={{ gap: cfg.gap, flexDirection: cfg.navBoxDir }}>
          {['Projects', 'Photos', 'Coursework'].map((label) => (
            <button
              key={label}
              onClick={() => navigate(`/${label.toLowerCase()}`)}
              className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex justify-between items-end overflow-hidden"
              style={{ paddingLeft: cfg.navBoxPx, paddingRight: cfg.navBoxPx, paddingTop: cfg.navBoxPy, paddingBottom: cfg.navBoxPy }}
            >
              <div>
                <p className="text-sm uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600 mb-3">{label}</p>
                <p className="text-xl text-zinc-500 dark:text-zinc-500">→</p>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden flex-shrink-0">
                <img src={profileImg} alt="" className="object-cover opacity-60" style={{ width: cfg.navBoxImgSize, height: cfg.navBoxImgSize }} />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="text-center w-full cursor-pointer"
        >
          <p className="text-[0.8rem] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600 mb-1">
            Analytics
          </p>
          <ChevronDown />
        </button>
      </section>

      {/* Section 2 — Analytics */}
      <section
        className="snap-start h-screen flex flex-col items-center justify-top"
        style={{ paddingLeft: cfg.analyticsPx, paddingRight: cfg.analyticsPx, paddingTop: '4rem', paddingBottom: '4rem', opacity: analyticsOpacity, transition: 'opacity 0.25s ease-out' }}
      >
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-center mb-6 cursor-pointer"
        >
          <p className="text-[0.8rem] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600 mb-1">Home</p>
          <ChevronUp />
        </button>

        <div className="w-full max-w-2xl max-w-[100rem]">
          <p className="text-[0.8rem] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600 mb-8">
            Analytics
          </p>

          <div className="flex gap-4 mb-10" >
            <StatCard label="Unique Users" value="—" />
            <StatCard label="API Requests" value="—" />
          </div>

          <div ref={calendarRef} className="w-full overflow-hidden bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
            <GitHubCalendar
              username={GITHUB_USERNAME}
              colorScheme={calScheme}
              theme={{
                light: [lerpHex('#d4d4d8', '#3f3f46', themeT), '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                dark:  [lerpHex('#d4d4d8', '#3f3f46', themeT), '#0e4429', '#006d32', '#26a641', '#39d353'],
              }}
              fontSize={13}
              blockSize={blockSize}
              blockMargin={2}
            />
          </div>
        </div>

      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 px-6 py-5 bg-white dark:bg-zinc-900">
      <p className="text-xs uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600 mb-2">{label}</p>
      <p className="text-3xl font-light text-zinc-800 dark:text-zinc-200 tabular-nums">{value}</p>
    </div>
  )
}

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-zinc-300 dark:text-zinc-700 animate-bounce"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ChevronUp() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-zinc-300 dark:text-zinc-700 animate-bounce"
    >
      <polyline points="6 15 12 9 18 15" />
    </svg>
  )
}

function lerpHex(a: string, b: string, t: number): string {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  const r = Math.round(p(a, 0) + (p(b, 0) - p(a, 0)) * t)
  const g = Math.round(p(a, 1) + (p(b, 1) - p(a, 1)) * t)
  const bl = Math.round(p(a, 2) + (p(b, 2) - p(a, 2)) * t)
  return `rgb(${r},${g},${bl})`
}
