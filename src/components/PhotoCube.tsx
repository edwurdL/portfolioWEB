import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Photo } from '../types'

type Vec = [number, number, number] // R, G, B in a unit cube centred on the origin

const toVec = (hex: string): Vec => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255 - 0.5) as Vec
const TICKS = [0, 50, 100, 150, 200, 250]
const at = (t: number) => t / 255 - 0.5

// Matplotlib's default 3D view: 30° up, azimuth -60°.
const START_AZIM = -Math.PI / 3, START_ELEV = Math.PI / 6
const SPIN = 0.15 // radians per second

export default function PhotoCube({ photos, className = '', caption = true }: { photos: Photo[]; className?: string; caption?: boolean }) {
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
      const ink = getComputedStyle(canvas).color // inherited text colour: follows the theme, white in the lightbox

      // Orthographic camera: `view` points at the viewer, `right`/`up` span the screen.
      const ca = Math.cos(azim), sa = Math.sin(azim), ce = Math.cos(elev), se = Math.sin(elev)
      const view: Vec = [ce * ca, ce * sa, se]
      const right: Vec = [-sa, ca, 0]
      const up: Vec = [-se * ca, -se * sa, ce]
      const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

      // Fit the cube into the canvas, with a little room for dots on its edges.
      const reach = 0.53
      const corners = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [x * reach, y * reach, z * reach] as Vec)))
      const xs = corners.map(c => dot(c, right)), ys = corners.map(c => dot(c, up))
      const scale = Math.min(w / (Math.max(...xs) - Math.min(...xs)), h / (Math.max(...ys) - Math.min(...ys)))
      const midX = (Math.max(...xs) + Math.min(...xs)) / 2, midY = (Math.max(...ys) + Math.min(...ys)) / 2
      const screen = (p: Vec) => [w / 2 + (dot(p, right) - midX) * scale, h / 2 - (dot(p, up) - midY) * scale] as const

      const line = (a: Vec, b: Vec) => {
        const [x1, y1] = screen(a), [x2, y2] = screen(b)
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
      }

      // Back panes: on each axis, the wall on the side away from the viewer.
      const back = view.map(v => (v > 0 ? -0.5 : 0.5)) as Vec
      ctx.lineWidth = 1
      for (let axis = 0; axis < 3; axis++) {
        const [u, v] = [0, 1, 2].filter(i => i !== axis)
        const pt = (a: number, b: number) => {
          const p: Vec = [0, 0, 0]
          p[axis] = back[axis]; p[u] = a; p[v] = b
          return p
        }
        ctx.beginPath()
        const quad = [pt(-0.5, -0.5), pt(0.5, -0.5), pt(0.5, 0.5), pt(-0.5, 0.5)].map(screen)
        quad.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
        ctx.closePath()
        ctx.fillStyle = ink
        ctx.globalAlpha = 0.04
        ctx.fill()
        ctx.beginPath()
        for (const t of TICKS) {
          line(pt(at(t), -0.5), pt(at(t), 0.5))
          line(pt(-0.5, at(t)), pt(0.5, at(t)))
        }
        ctx.strokeStyle = ink
        ctx.globalAlpha = 0.12
        ctx.stroke()
      }

      // Axes in their own colour: the three edges out of the inner corner where
      // the back panes meet, each running along one channel.
      const axes: [number, string][] = [[0, '#dc2626'], [1, '#16a34a'], [2, '#2563eb']]
      ctx.globalAlpha = 1
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      for (const [axis, hex] of axes) {
        const from = [...back] as Vec, to = [...back] as Vec
        from[axis] = -0.5
        to[axis] = 0.5
        ctx.beginPath()
        line(from, to)
        ctx.strokeStyle = hex
        ctx.stroke()
      }

      // Dots, far first so near ones cover them.
      const dots = points.map(p => ({ xy: screen(p.at), depth: dot(p.at, view), hex: p.hex })).sort((a, b) => a.depth - b.depth)
      const r = Math.max(2, scale * 0.016)
      ctx.lineWidth = 0.75
      for (const d of dots) {
        ctx.beginPath()
        ctx.arc(d.xy[0], d.xy[1], r, 0, Math.PI * 2)
        ctx.globalAlpha = 0.6
        ctx.fillStyle = d.hex
        ctx.fill()
        ctx.strokeStyle = d.hex
        ctx.globalAlpha = 0.9
        ctx.stroke()
      }

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
