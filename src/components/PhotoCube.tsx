import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Photo } from '../types'

type Vec = [number, number, number] // world x, y, z with z up; the unit cube is centred on the origin

// x = red, y = blue, z (up) = green, each 0–255 mapped onto -0.5…0.5.
const toVec = (hex: string): Vec => [1, 5, 3].map(i => parseInt(hex.slice(i, i + 2), 16) / 255 - 0.5) as Vec
const ORIGIN: Vec = [-0.5, -0.5, -0.5] // black
const AXIS_LEN = 1.1 // a little past 255
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

// Furthest anything drawn gets from the cube's centre: the axis letters.
const FIT_RADIUS = Math.max(...AXES.map(a => Math.hypot(...along(a.dir, AXIS_LEN + 0.1))))

// Matplotlib's default 3D view: 30° up, azimuth -60°.
const START_AZIM = -Math.PI / 3, START_ELEV = Math.PI / 6
const SPIN = 0.15 // radians per second

export default function PhotoCube({ photos, className = '', caption = true }: {
  photos: Photo[]
  className?: string
  /** The line under the plot, with a link to the gallery. */
  caption?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const plotted = photos.filter(p => p.avgColor)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const points = plotted.map(p => ({ at: toVec(p.avgColor!), hex: p.avgColor! }))
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

      // Fixed framing: the cube's centre stays mid-canvas and the zoom fits a sphere
      // holding the cube and axis letters, so turning it never slides or rescales it.
      const scale = (Math.min(w, h) / 2 - 8) / FIT_RADIUS
      const screen = (p: Vec) => [w / 2 + dot(p, right) * scale, h / 2 - dot(p, up) * scale] as const
      const line = (a: Vec, b: Vec) => {
        const [x1, y1] = screen(a), [x2, y2] = screen(b)
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
      }

      // Axes out of the black corner, each in its channel's colour.
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
        ctx.fillText(a.label, ...screen(along(a.dir, AXIS_LEN + 0.08)))
      }

      // Dots, far first so near ones cover them.
      const dots = points.map(p => ({ xy: screen(p.at), depth: dot(p.at, view), hex: p.hex })).sort((a, b) => a.depth - b.depth)
      const r = Math.max(1.5, scale * 0.008)
      for (const d of dots) {
        ctx.beginPath()
        ctx.arc(d.xy[0], d.xy[1], r, 0, Math.PI * 2)
        ctx.fillStyle = d.hex
        ctx.fill()
      }
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
  }, [plotted.length, photos]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <figure className={`flex flex-col ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`3D scatter plot of ${plotted.length} photos by average red, green and blue`}
        // pan-y: a vertical swipe still scrolls the page on a phone; sideways turns the plot.
        className="block w-full flex-1 min-h-0 cursor-grab active:cursor-grabbing touch-pan-y"
      />
      {caption && <figcaption className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {plotted.length ? `${plotted.length} photos` : 'Photos'} by average colour. Drag to turn.{' '}
        <Link to="/photos" className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-current">Gallery</Link>
      </figcaption>}
    </figure>
  )
}
