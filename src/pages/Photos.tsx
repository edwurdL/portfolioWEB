import { useEffect, useMemo, useRef, useState } from 'react'
import { loadPhotos, loadedPhotos } from '../lib/api'
import { bandOf } from '../lib/colorBand'
import { createPhoto } from '../types'
import type { Photo } from '../types'
import deadfile from '../assets/deadfile.webp'
import Lightbox from '../components/Lightbox'
import PhotoCube from '../components/PhotoCube'

const CATEGORIES = ['All', 'Animal', 'Landscape', 'Portrait', 'Street', 'Architecture', 'Abstract']

// One per band in lib/colorBand; a swatch shows every photo whose color falls in its band.
const COLOR_SWATCHES = [
  { label: 'Red',     hex: '#dc2626' },
  { label: 'Warm',    hex: '#f97316' },
  { label: 'Yellow',  hex: '#ca8a04' },
  { label: 'Green',   hex: '#16a34a' },
  { label: 'Teal',    hex: '#0891b2' },
  { label: 'Blue',    hex: '#2563eb' },
  { label: 'Purple',  hex: '#7c3aed' },
  { label: 'Neutral', hex: '#71717a' },
  { label: 'Dark',    hex: '#1c1917' },
  { label: 'Light',   hex: '#e4e4e7' },
]

export const MOCK: Required<Photo>[] = [
  { id:'1',  url:deadfile, ratio:'3/4',  category:'Animal',       prominentColor:'#16a34a', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4',  focalLength:'85mm',  shutterSpeed:'1/500s',  aperture:'f/1.4', iso:400,  date:'2024-11-03', location:'Ann Arbor, MI',     descriptor:'Golden hour in the field' } },
  { id:'2',  url:deadfile, ratio:'4/3',  category:'Landscape',    prominentColor:'#2563eb', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8',  focalLength:'24mm',  shutterSpeed:'1/250s',  aperture:'f/8', iso:100,  date:'2024-09-14', location:'Sleeping Bear, MI',  descriptor:'Dune at dusk' } },
  { id:'3',  url:deadfile, ratio:'1/1',  category:'Portrait',     prominentColor:'#f97316', meta:{ camera:'Sony A7IV', lens:'50mm f/1.2',  focalLength:'50mm',  shutterSpeed:'1/125s',  aperture:'f/1.8', iso:800,  date:'2024-10-22', location:'Detroit, MI',        descriptor:'Street portrait' } },
  { id:'4',  url:deadfile, ratio:'2/3',  category:'Street',       prominentColor:'#1c1917', meta:{ camera:'Sony A7IV', lens:'35mm f/2',    focalLength:'35mm',  shutterSpeed:'1/60s',   aperture:'f/2', iso:1600, date:'2024-08-05', location:'Chicago, IL',        descriptor:'Late night downtown' } },
  { id:'5',  url:deadfile, ratio:'16/9', category:'Landscape',    prominentColor:'#0891b2', meta:{ camera:'Sony A7IV', lens:'16mm f/2.8',  focalLength:'16mm',  shutterSpeed:'1/1000s', aperture:'f/11', iso:200,  date:'2024-07-18', location:'Lake Michigan',       descriptor:'Wide open water' } },
  { id:'6',  url:deadfile, ratio:'3/4',  category:'Animal',       prominentColor:'#ca8a04', meta:{ camera:'Sony A7IV', lens:'200mm f/4',   focalLength:'200mm', shutterSpeed:'1/2000s', aperture:'f/4', iso:2000, date:'2024-06-30', location:'UP, MI',             descriptor:'Red fox at dawn' } },
  { id:'7',  url:deadfile, ratio:'1/1',  category:'Portrait',     prominentColor:'#e4e4e7', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4',  focalLength:'85mm',  shutterSpeed:'1/200s',  aperture:'f/1.6', iso:320,  date:'2024-05-11', location:'Ann Arbor, MI',      descriptor:'Overcast light' } },
  { id:'8',  url:deadfile, ratio:'4/5',  category:'Architecture', prominentColor:'#71717a', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8',  focalLength:'24mm',  shutterSpeed:'1/100s',  aperture:'f/8', iso:100,  date:'2024-04-02', location:'Chicago, IL',        descriptor:'Brutalist facade' } },
  { id:'9',  url:deadfile, ratio:'3/2',  category:'Landscape',    prominentColor:'#dc2626', meta:{ camera:'Sony A7IV', lens:'35mm f/2',    focalLength:'35mm',  shutterSpeed:'1/30s',   aperture:'f/11', iso:100,  date:'2024-03-20', location:'Pictured Rocks, MI', descriptor:'Sunset cliffs' } },
  { id:'10', url:deadfile, ratio:'2/3',  category:'Street',       prominentColor:'#7c3aed', meta:{ camera:'Sony A7IV', lens:'35mm f/2',    focalLength:'35mm',  shutterSpeed:'1/15s',   aperture:'f/2', iso:3200, date:'2024-02-14', location:'Detroit, MI',        descriptor:'Neon reflections' } },
  { id:'11', url:deadfile, ratio:'1/1',  category:'Abstract',     prominentColor:'#2563eb', meta:{ camera:'Sony A7IV', lens:'100mm macro', focalLength:'100mm', shutterSpeed:'1/400s',  aperture:'f/16', iso:640,  date:'2024-01-08', location:'Studio',             descriptor:'Water droplet study' } },
  { id:'12', url:deadfile, ratio:'4/3',  category:'Portrait',     prominentColor:'#f97316', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4',  focalLength:'85mm',  shutterSpeed:'1/160s',  aperture:'f/2', iso:400,  date:'2023-12-24', location:'Ann Arbor, MI',      descriptor:'Winter light' } },
  { id:'13', url:deadfile, ratio:'2/3',  category:'Landscape',    prominentColor:'#16a34a', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8',  focalLength:'24mm',  shutterSpeed:'1/320s',  aperture:'f/9', iso:100,  date:'2023-11-10', location:'Porcupine Mtns, MI', descriptor:'Autumn ridge' } },
  { id:'14', url:deadfile, ratio:'3/4',  category:'Street',       prominentColor:'#1c1917', meta:{ camera:'Sony A7IV', lens:'35mm f/2',    focalLength:'35mm',  shutterSpeed:'1/80s',   aperture:'f/2', iso:2500, date:'2023-10-05', location:'New York, NY',       descriptor:'Subway platform' } },
  { id:'15', url:deadfile, ratio:'1/1',  category:'Abstract',     prominentColor:'#dc2626', meta:{ camera:'Sony A7IV', lens:'100mm macro', focalLength:'100mm', shutterSpeed:'1/1600s', aperture:'f/8', iso:200,  date:'2023-09-18', location:'Studio',             descriptor:'Flame study' } },
  { id:'16', url:deadfile, ratio:'16/9', category:'Landscape',    prominentColor:'#ca8a04', meta:{ camera:'Sony A7IV', lens:'16mm f/2.8',  focalLength:'16mm',  shutterSpeed:'1/800s',  aperture:'f/10', iso:100,  date:'2023-08-22', location:'Dunes, MI',          descriptor:'Golden hour sand' } },
  { id:'17', url:deadfile, ratio:'4/5',  category:'Portrait',     prominentColor:'#7c3aed', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4',  focalLength:'85mm',  shutterSpeed:'1/200s',  aperture:'f/1.4', iso:1600, date:'2023-07-14', location:'Detroit, MI',        descriptor:'Stage lights' } },
  { id:'18', url:deadfile, ratio:'3/2',  category:'Animal',       prominentColor:'#0891b2', meta:{ camera:'Sony A7IV', lens:'400mm f/5.6', focalLength:'400mm', shutterSpeed:'1/3200s', aperture:'f/5.6', iso:3200, date:'2023-06-01', location:'Lake Erie',           descriptor:'Heron at dawn' } },
  { id:'19', url:deadfile, ratio:'2/3',  category:'Architecture', prominentColor:'#e4e4e7', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8',  focalLength:'24mm',  shutterSpeed:'1/200s',  aperture:'f/8', iso:100,  date:'2023-05-09', location:'Chicago, IL',        descriptor:'Glass tower' } },
  { id:'20', url:deadfile, ratio:'1/1',  category:'Street',       prominentColor:'#f97316', meta:{ camera:'Sony A7IV', lens:'35mm f/2',    focalLength:'35mm',  shutterSpeed:'1/250s',  aperture:'f/4', iso:800,  date:'2023-04-17', location:'Ann Arbor, MI',      descriptor:'Farmers market' } },
  { id:'21', url:deadfile, ratio:'4/3',  category:'Landscape',    prominentColor:'#2563eb', meta:{ camera:'Sony A7IV', lens:'50mm f/1.2',  focalLength:'50mm',  shutterSpeed:'1/500s',  aperture:'f/8', iso:100,  date:'2023-03-30', location:'Lake Superior',       descriptor:'Ice shelf breakup' } },
  { id:'22', url:deadfile, ratio:'3/4',  category:'Portrait',     prominentColor:'#16a34a', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4',  focalLength:'85mm',  shutterSpeed:'1/125s',  aperture:'f/2.8', iso:400,  date:'2023-02-12', location:'Studio',             descriptor:'Environmental portrait' } },
  { id:'23', url:deadfile, ratio:'2/3',  category:'Abstract',     prominentColor:'#7c3aed', meta:{ camera:'Sony A7IV', lens:'100mm macro', focalLength:'100mm', shutterSpeed:'1/640s',  aperture:'f/11', iso:320,  date:'2023-01-25', location:'Studio',             descriptor:'Ink diffusion' } },
  { id:'24', url:deadfile, ratio:'16/9', category:'Animal',       prominentColor:'#ca8a04', meta:{ camera:'Sony A7IV', lens:'200mm f/4',   focalLength:'200mm', shutterSpeed:'1/1000s', aperture:'f/5.6', iso:1600, date:'2022-12-08', location:'UP, MI',             descriptor:'Deer in snow' } },
  { id:'25', url:deadfile, ratio:'4/5',  category:'Architecture', prominentColor:'#71717a', meta:{ camera:'Sony A7IV', lens:'35mm f/2',    focalLength:'35mm',  shutterSpeed:'1/160s',  aperture:'f/8', iso:100,  date:'2022-11-03', location:'Detroit, MI',        descriptor:'Abandoned factory' } },
  { id:'26', url:deadfile, ratio:'3/2',  category:'Street',       prominentColor:'#dc2626', meta:{ camera:'Sony A7IV', lens:'35mm f/2',    focalLength:'35mm',  shutterSpeed:'1/100s',  aperture:'f/2.8', iso:1250, date:'2022-10-19', location:'Chicago, IL',        descriptor:'Red line rush hour' } },
  { id:'27', url:deadfile, ratio:'1/1',  category:'Landscape',    prominentColor:'#0891b2', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8',  focalLength:'24mm',  shutterSpeed:'1/400s',  aperture:'f/8', iso:100,  date:'2022-09-07', location:'Apostle Islands, WI', descriptor:'Sea cave reflection' } },
  { id:'28', url:deadfile, ratio:'2/3',  category:'Portrait',     prominentColor:'#1c1917', meta:{ camera:'Sony A7IV', lens:'50mm f/1.2',  focalLength:'50mm',  shutterSpeed:'1/50s',   aperture:'f/1.4', iso:3200, date:'2022-08-14', location:'Detroit, MI',        descriptor:'Low key study' } },
  { id:'29', url:deadfile, ratio:'4/3',  category:'Animal',       prominentColor:'#16a34a', meta:{ camera:'Sony A7IV', lens:'400mm f/5.6', focalLength:'400mm', shutterSpeed:'1/2500s', aperture:'f/5.6', iso:800,  date:'2022-07-22', location:'Kalamazoo, MI',      descriptor:'Monarch on milkweed' } },
  { id:'30', url:deadfile, ratio:'3/4',  category:'Abstract',     prominentColor:'#f97316', meta:{ camera:'Sony A7IV', lens:'100mm macro', focalLength:'100mm', shutterSpeed:'1/320s',  aperture:'f/16', iso:640,  date:'2022-06-03', location:'Studio',             descriptor:'Rust texture' } },
].map(createPhoto)

/** Hue in 10° steps (0–36) so near-equal hues sort by date; grays get 37, after every color. */
function hueBucket(hex: string): number {
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  const d = max - min
  if (d < 0.08) return 37
  let h = 0
  if (max === r) h = ((g-b)/d + (g<b?6:0))/6
  else if (max === g) h = ((b-r)/d + 2)/6
  else h = ((r-g)/d + 4)/6
  return Math.round(h * 36)
}

const SKELETON_RATIOS = ['3/4', '1/1', '4/5', '2/3', '16/9', '3/4', '1/1', '4/5']

/** Tiles near the top that load right away instead of waiting their turn. */
const EAGER_TILES = 8

// The mock set stands in only during local dev (the API blocks localhost via CORS);
// live visitors never see invented photos.
const toGallery = (list: Photo[]): Required<Photo>[] =>
  list.length || !import.meta.env.DEV ? list.map(createPhoto) : MOCK

/** Missing or 'N/A' dates count as oldest, so they can't scramble the order. */
const timeOf = (p: Required<Photo>) => Date.parse(String(p.meta.date)) || 0

function colsFor(w: number) {
  return w >= 1024 ? 4 : w >= 768 ? 3 : 2
}

function useColumnCount() {
  const [cols, setCols] = useState(() => (typeof window === 'undefined' ? 2 : colsFor(window.innerWidth)))
  useEffect(() => {
    const on = () => setCols(colsFor(window.innerWidth))
    window.addEventListener('resize', on, { passive: true })
    return () => window.removeEventListener('resize', on)
  }, [])
  return cols
}

export default function Photos() {
  // Coming from Home, the list is usually already here, so there's nothing to wait for.
  const [photos, setPhotos] = useState<Required<Photo>[]>(() => {
    const ready = loadedPhotos()
    return ready ? toGallery(ready) : []
  })
  const [loading, setLoading] = useState(() => !loadedPhotos())
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState<Record<string, true>>({})
  const [category, setCategory] = useState('All')
  const [colorFilter, setColorFilter] = useState<string | null>(null)
  const [newestFirst, setNewestFirst] = useState(true)
  const [spectrumActive, setSpectrumActive] = useState(false)
  const [plotOpen, setPlotOpen] = useState(false)
  const [selected, setSelected] = useState<Required<Photo> | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [ratios, setRatios] = useState<Record<string, string>>({})
  const columns = useColumnCount()

  useEffect(() => {
    // Fetched once per visit and shared with Home (API is rate-limited).
    // Skeletons show until this resolves.
    if (!loading) return
    loadPhotos()
      .then(data => setPhotos(toGallery(data)))
      .catch(() => (import.meta.env.DEV ? setPhotos(MOCK) : setFailed(true)))
      .finally(() => setLoading(false))
  }, [])

  const closeModal = () => {
    setModalVisible(false)
    setTimeout(() => setSelected(null), 250)
  }

  // Same behavior as components/Lightbox: page locked, Escape closes, focus
  // moves to the close button and returns to the tile afterwards.
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!selected) return
    const returnFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => setModalVisible(true))
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      returnFocus?.focus()
    }
  }, [selected])

  // Memoized so image loads (which update `loaded`/`ratios`) don't re-sort ~600 photos each.
  const filtered = useMemo(() => photos
    .filter(p => category === 'All' || p.category === category)
    .filter(p => !colorFilter || bandOf(p.prominentColor) === colorFilter)
    .sort((a, b) =>
      (spectrumActive ? hueBucket(a.prominentColor) - hueBucket(b.prominentColor) : 0) ||
      (newestFirst ? timeOf(b) - timeOf(a) : timeOf(a) - timeOf(b))
    ), [photos, category, colorFilter, spectrumActive, newestFirst])

  // Distribute into fixed columns round-robin. Unlike CSS multicol, each column
  // is an independent stack, so a tile changing height only shifts the tiles
  // below it in its own column — tiles never rebalance across columns.
  // Remember each photo's position too: the first few load eagerly.
  const buckets: { photo: Required<Photo>; rank: number }[][] = Array.from({ length: columns }, () => [])
  filtered.forEach((photo, rank) => buckets[rank % columns].push({ photo, rank }))

  const toggleClass = (on: boolean) =>
    `py-1 cursor-pointer transition-colors ${
      on
        ? 'text-zinc-900 dark:text-zinc-100 underline decoration-1 underline-offset-[6px]'
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
    }`

  return (
    <>
      {/* Filter toolbar */}
      <div className="md:sticky md:top-14 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="frame py-3 flex items-center gap-x-6 gap-y-3 flex-wrap text-sm">
          <label className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <span className="sr-only sm:not-sr-only">Category</span>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="cursor-pointer bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 pr-1 text-zinc-900 dark:text-zinc-100 hover:border-zinc-900 dark:hover:border-zinc-100"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="bg-white dark:bg-zinc-900">{c === 'All' ? 'All photos' : c}</option>
              ))}
            </select>
          </label>

          <div role="group" aria-label="Order" className="flex gap-4">
            <button onClick={() => setNewestFirst(true)} aria-pressed={newestFirst} className={toggleClass(newestFirst)}>Newest</button>
            <button onClick={() => setNewestFirst(false)} aria-pressed={!newestFirst} className={toggleClass(!newestFirst)}>Oldest</button>
          </div>

          <button
            onClick={() => setSpectrumActive(v => !v)}
            aria-pressed={spectrumActive}
            className={`flex items-center gap-2 ${toggleClass(spectrumActive)}`}
          >
            {/* The order this sorts into, drawn as a key. */}
            <span
              aria-hidden="true"
              className="block w-6 h-1.5"
              style={{ background: 'linear-gradient(to right, #dc2626, #f97316, #ca8a04, #16a34a, #0891b2, #2563eb, #7c3aed)' }}
            />
            By color
          </button>

          <div role="group" aria-label="Filter by color" className="flex items-center gap-1.5">
            {COLOR_SWATCHES.map(s => (
              <button
                key={s.label}
                title={s.label}
                aria-label={`${s.label} photos`}
                aria-pressed={colorFilter === s.hex}
                onClick={() => setColorFilter(colorFilter === s.hex ? null : s.hex)}
                className={`w-4 h-4 cursor-pointer flex-shrink-0 border border-black/10 dark:border-white/15 outline-offset-2 ${
                  colorFilter === s.hex ? 'outline outline-1 outline-zinc-900 dark:outline-zinc-100' : ''
                }`}
                style={{ backgroundColor: s.hex }}
              />
            ))}
            {colorFilter && (
              <button onClick={() => setColorFilter(null)} className="ml-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => setPlotOpen(true)}
            disabled={loading}
            className={`flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-default ${toggleClass(false)}`}
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Color plot
          </button>

          {!loading && (
            <p className="ml-auto text-zinc-500 dark:text-zinc-400 tabular-nums">
              {filtered.length} {filtered.length === 1 ? 'photo' : 'photos'}
            </p>
          )}
        </div>
      </div>

      {plotOpen && (
        <Lightbox
          label="Color plot"
          caption={`${filtered.length} ${filtered.length === 1 ? 'photo' : 'photos'} by average color. Drag to turn. Inspired by joshg.us/colormap.html`}
          onClose={() => setPlotOpen(false)}
        >
          {/* Stop clicks here so dragging the plot doesn't close the lightbox. */}
          <div
            onClick={e => e.stopPropagation()}
            className="text-white cursor-default"
            style={{ width: 'min(calc(100vw - 2rem), calc(var(--lightbox-h) * 4 / 3))', height: 'var(--lightbox-h)' }}
          >
            <PhotoCube photos={filtered} caption={false} className="w-full h-full" />
          </div>
        </Lightbox>
      )}

      {/* Masonry grid */}
      <main className="frame pt-6 pb-20">
      {loading ? (
        <div className="flex gap-2 sm:gap-3" aria-label="Loading photos">
          {Array.from({ length: columns }).map((_, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-2 sm:gap-3 min-w-0">
              {SKELETON_RATIOS.map((_, i) => (
                <div
                  key={i}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                  style={{ aspectRatio: SKELETON_RATIOS[(i + ci) % SKELETON_RATIOS.length] }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-24 text-zinc-500 dark:text-zinc-400">
          {failed ? 'The gallery is offline right now. Try again in a bit.' : 'No photos match these filters.'}
        </p>
      ) : (
        <div className="flex gap-2 sm:gap-3">
          {buckets.map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-2 sm:gap-3 min-w-0">
              {col.map(({ photo, rank }) => (
                <button
                  key={photo.id}
                  type="button"
                  aria-label={`Open ${photo.meta.descriptor}`}
                  className="group block w-full cursor-zoom-in"
                  onClick={() => setSelected(photo)}
                >
                  {/* Until it arrives the tile shows the photo's own prominent
                      color; the image then fades in over it. */}
                  <div
                    className="w-full overflow-hidden"
                    style={{ aspectRatio: ratios[photo.id] ?? photo.ratio, backgroundColor: photo.prominentColor }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.meta.descriptor}
                      loading={rank < EAGER_TILES ? 'eager' : 'lazy'}
                      fetchPriority={rank < EAGER_TILES ? 'high' : 'auto'}
                      decoding="async"
                      className={`w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.02] ${loaded[photo.id] ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={e => {
                        const { naturalWidth: w, naturalHeight: h } = e.currentTarget
                        if (w && h) setRatios(r => (r[photo.id] ? r : { ...r, [photo.id]: `${w}/${h}` }))
                        setLoaded(l => (l[photo.id] ? l : { ...l, [photo.id]: true }))
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      </main>

      {/* Photo view: the picture as large as the screen allows, its label beside it. */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-4 sm:p-8"
          style={{ opacity: modalVisible ? 1 : 0, transition: 'opacity 250ms ease' }}
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.meta.descriptor}
            className="w-full max-w-[85rem] max-h-full overflow-y-auto grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10 lg:items-end text-zinc-300"
            style={{ transform: modalVisible ? 'scale(1)' : 'scale(0.98)', transition: 'transform 250ms ease' }}
            onClick={e => e.stopPropagation()}
          >
            <img src={selected.url} alt={selected.meta.descriptor} className="block mx-auto max-w-full max-h-[70vh] lg:max-h-[88vh] object-contain" />

            <div className="pb-1">
              <h2 className="font-serif text-3xl leading-tight text-zinc-50">{selected.meta.descriptor}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {[selected.category, selected.meta.location, selected.meta.date].filter(v => v && v !== 'N/A').join(' · ')}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-zinc-700 pt-5 text-sm">
                {([
                  ['Camera', selected.meta.camera],
                  ['Lens', selected.meta.lens],
                  ['Focal length', selected.meta.focalLength],
                  ['Aperture', selected.meta.aperture],
                  ['Shutter', selected.meta.shutterSpeed],
                  ['ISO', String(selected.meta.iso)],
                ] as const).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-zinc-500">{label}</dt>
                    <dd className="mt-0.5 text-zinc-100">{value}</dd>
                  </div>
                ))}
                <div className="col-span-2 flex items-center gap-2">
                  <dt className="text-zinc-500">Color</dt>
                  <dd className="w-4 h-4 border border-white/20" style={{ backgroundColor: selected.prominentColor }}><span className="sr-only">{selected.prominentColor}</span></dd>
                </div>
              </dl>
            </div>
          </div>

          <button
            ref={closeRef}
            onClick={closeModal}
            aria-label="Close photo"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1 text-zinc-400 hover:text-zinc-50 cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </>
  )
}
