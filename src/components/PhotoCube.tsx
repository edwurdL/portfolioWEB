import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Photo } from '../types'

type Vec = [number, number, number] // world x, y, z with z up; the unit cube is centered on the origin

// x = red, y = blue, z (up) = green, each 0–255 mapped onto -0.5…0.5.
const toVec = (hex: string): Vec => [1, 5, 3].map(i => parseInt(hex.slice(i, i + 2), 16) / 255 - 0.5) as Vec
const ORIGIN: Vec = [-0.5, -0.5, -0.5] // black
const AXIS_LEN = 1.05 // a little past 255
const LETTER_AT = AXIS_LEN + 0.07 // axis letters just beyond the line ends
const AXES: { dir: number; hex: string; label: string }[] = [
  { dir: 0, hex: '#ef4444', label: 'R' },
  { dir: 2, hex: '#22c55e', label: 'G' },
  { dir: 1, hex: '#3b82f6', label: 'B' },
]
const along = (dir: number, len: number): Vec => {
  const p = [...ORIGIN] as Vec
  p[dir] += len
  return p
}

// Everything drawn: the cube's corners (all dots sit inside it) and the axis letters.
const FIT_POINTS: Vec[] = [
  ...[-0.5, 0.5].flatMap(x => [-0.5, 0.5].flatMap(y => [-0.5, 0.5].map(z => [x, y, z] as Vec))),
  ...AXES.map(a => along(a.dir, LETTER_AT)),
]
// Spinning is round the vertical axis, so sideways the plot never reaches past the
// widest point's distance from that axis; tilting can bring any point to the top or
// bottom, so vertically it needs the full distance from the center.
const FIT_SIDE = Math.max(...FIT_POINTS.map(([x, y]) => Math.hypot(x, y)))
const FIT_RADIUS = Math.max(...FIT_POINTS.map(p => Math.hypot(...p)))
const FIT_PAD = 8 // px, so the letters don't touch the edge

// Matplotlib's default 3D view: 30° up, azimuth -60°.
const START_AZIM = -Math.PI / 3, START_ELEV = Math.PI / 6
const SPIN = 0.15 // radians per second

export default function PhotoCube({ photos, className = '', caption = true, highlight }: {
  photos: Photo[]
  className?: string
  /** The line under the plot, with a link to the gallery. */
  caption?: boolean
  /** Id of one photo to pick out, with guide lines showing where it sits. */
  highlight?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const plotted = photos.filter(p => p.avgColor)
  const picked = highlight ? plotted.find(p => p.id === highlight) : undefined

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const points = plotted.map(p => ({ id: p.id, at: toVec(p.avgColor!), hex: p.avgColor! }))
    const pick = points.find(p => p.id === picked?.id)
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let azim = START_AZIM, elev = START_ELEV, visible = true, dirty = true, frame = 0, last = 0
    let drag: { x: number; y: number } | null = null

    const draw = () => {
      const dpr = devicePixelRatio || 1
      const w = canvas.clientWidth, h = canvas.clientHeight
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Orthographic camera: `view` points at the viewer, `right`/`up` span the screen.
      const ca = Math.cos(azim), sa = Math.sin(azim), ce = Math.cos(elev), se = Math.sin(elev)
      const view: Vec = [ce * ca, ce * sa, se]
      const right: Vec = [-sa, ca, 0]
      const up: Vec = [-se * ca, -se * sa, ce]
      const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

      // Fixed framing: the cube's center stays mid-canvas and the zoom fits every
      // angle the plot can reach, so turning it never slides or rescales it.
      const scale = Math.min((w / 2 - FIT_PAD) / FIT_SIDE, (h / 2 - FIT_PAD) / FIT_RADIUS)
      const screen = (p: Vec) => [w / 2 + dot(p, right) * scale, h / 2 - dot(p, up) * scale] as const
      const line = (a: Vec, b: Vec) => {
        const [x1, y1] = screen(a), [x2, y2] = screen(b)
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
      }

      // Axes out of the black corner, each in its channel's color.
      ctx.globalAlpha = 1
      ctx.lineWidth = 1.5
      ctx.font = '600 13px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const a of AXES) {
        ctx.beginPath()
        line(ORIGIN, along(a.dir, AXIS_LEN))
        ctx.strokeStyle = a.hex
        ctx.stroke()
        ctx.fillStyle = a.hex
        ctx.fillText(a.label, ...screen(along(a.dir, LETTER_AT)))
      }

      // Dots, far first so near ones cover them.
      const dots = points.map(p => ({ xy: screen(p.at), depth: dot(p.at, view), hex: p.hex })).sort((a, b) => a.depth - b.depth)
      const r = Math.max(1.5, scale * 0.008)
      ctx.globalAlpha = pick ? 0.35 : 1 // the rest step back when one photo is picked out
      for (const d of dots) {
        ctx.beginPath()
        ctx.arc(d.xy[0], d.xy[1], r, 0, Math.PI * 2)
        ctx.fillStyle = d.hex
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (!pick) return

      // The picked photo, drawn on top: guides drop from it to the floor (green = 0)
      // and run across to the red and blue axes, like reading a point off a 3D chart.
      const ink = getComputedStyle(canvas).color
      const [x, y] = pick.at
      const foot: Vec = [x, y, ORIGIN[2]]
      ctx.beginPath()
      line(pick.at, foot)
      line(foot, [x, ORIGIN[1], ORIGIN[2]])
      line(foot, [ORIGIN[0], y, ORIGIN[2]])
      ctx.setLineDash([3, 3])
      ctx.strokeStyle = ink
      ctx.globalAlpha = 0.7
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
      const [px, py] = screen(pick.at)
      ctx.beginPath()
      ctx.arc(px, py, r * 2.5 + 2, 0, Math.PI * 2)
      ctx.fillStyle = pick.hex
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(px, py, r * 2.5 + 7, 0, Math.PI * 2)
      ctx.globalAlpha = 0.5
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
      last = now
      if (!still && !drag) {
        azim += dt * SPIN
        dirty = true
      }
      if (dirty) draw()
      dirty = false
      frame = visible ? requestAnimationFrame(tick) : 0
    }

    // Only animate while on screen.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !frame) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
    })
    io.observe(canvas)

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY }
      canvas.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      azim -= (e.clientX - drag.x) * 0.01
      elev = Math.max(0.05, Math.min(1.4, elev + (e.clientY - drag.y) * 0.01))
      drag = { x: e.clientX, y: e.clientY }
      dirty = true
    }
    const up = () => { drag = null }
    const resize = new ResizeObserver(() => { dirty = true })
    resize.observe(canvas)
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      resize.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
    }
  }, [plotted.length, photos, picked?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <figure className={`flex flex-col ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`3D scatter plot of ${plotted.length} photos by average red, green and blue${
          picked ? `, with this photo marked at ${picked.avgColor}` : ''}`}
        // pan-y: a vertical swipe still scrolls the page on a phone; sideways turns the plot.
        className="block w-full flex-1 min-h-0 cursor-grab active:cursor-grabbing touch-pan-y"
      />
      {/* One line, never wrapping: phones drop "by average color" to make room. */}
      {caption && <figcaption className="mt-1.5 text-xs whitespace-nowrap overflow-hidden text-ellipsis text-zinc-500 dark:text-zinc-400">
        {plotted.length ? `${plotted.length} photos` : 'Photos'}<span className="hidden sm:inline"> by average color</span>{' · '}
        <Link to="/photos" className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-current">Gallery</Link>
        {' · '}Inspired by{' '}
        <a href="https://joshg.us/colormap.html" target="_blank" rel="noopener noreferrer" className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-current">joshg.us</a>
      </figcaption>}
    </figure>
  )
}
