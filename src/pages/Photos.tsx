import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPhotos } from '../lib/api'
import type { Photo } from '../types'
import deadfile from '../assets/deadfile.png'

const CATEGORIES = ['All', 'Animal', 'Landscape', 'Portrait', 'Street', 'Architecture', 'Abstract']

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

const MOCK: Photo[] = [
  { id:'1',  url:deadfile, ratio:'3/4',  category:'Animal',       prominentColor:'#16a34a', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4', focalLength:'85mm',  iso:400,  date:'2024-11-03', location:'Ann Arbor, MI',     descriptor:'Golden hour in the field' } },
  { id:'2',  url:deadfile, ratio:'4/3',  category:'Landscape',    prominentColor:'#2563eb', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8', focalLength:'24mm',  iso:100,  date:'2024-09-14', location:'Sleeping Bear, MI',  descriptor:'Dune at dusk' } },
  { id:'3',  url:deadfile, ratio:'1/1',  category:'Portrait',     prominentColor:'#f97316', meta:{ camera:'Sony A7IV', lens:'50mm f/1.2', focalLength:'50mm',  iso:800,  date:'2024-10-22', location:'Detroit, MI',        descriptor:'Street portrait' } },
  { id:'4',  url:deadfile, ratio:'2/3',  category:'Street',       prominentColor:'#1c1917', meta:{ camera:'Sony A7IV', lens:'35mm f/2',   focalLength:'35mm',  iso:1600, date:'2024-08-05', location:'Chicago, IL',        descriptor:'Late night downtown' } },
  { id:'5',  url:deadfile, ratio:'16/9', category:'Landscape',    prominentColor:'#0891b2', meta:{ camera:'Sony A7IV', lens:'16mm f/2.8', focalLength:'16mm',  iso:200,  date:'2024-07-18', location:'Lake Michigan',       descriptor:'Wide open water' } },
  { id:'6',  url:deadfile, ratio:'3/4',  category:'Animal',       prominentColor:'#ca8a04', meta:{ camera:'Sony A7IV', lens:'200mm f/4',  focalLength:'200mm', iso:2000, date:'2024-06-30', location:'UP, MI',             descriptor:'Red fox at dawn' } },
  { id:'7',  url:deadfile, ratio:'1/1',  category:'Portrait',     prominentColor:'#e4e4e7', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4', focalLength:'85mm',  iso:320,  date:'2024-05-11', location:'Ann Arbor, MI',      descriptor:'Overcast light' } },
  { id:'8',  url:deadfile, ratio:'4/5',  category:'Architecture', prominentColor:'#71717a', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8', focalLength:'24mm',  iso:100,  date:'2024-04-02', location:'Chicago, IL',        descriptor:'Brutalist facade' } },
  { id:'9',  url:deadfile, ratio:'3/2',  category:'Landscape',    prominentColor:'#dc2626', meta:{ camera:'Sony A7IV', lens:'35mm f/2',   focalLength:'35mm',  iso:100,  date:'2024-03-20', location:'Pictured Rocks, MI', descriptor:'Sunset cliffs' } },
  { id:'10', url:deadfile, ratio:'2/3',  category:'Street',       prominentColor:'#7c3aed', meta:{ camera:'Sony A7IV', lens:'35mm f/2',   focalLength:'35mm',  iso:3200, date:'2024-02-14', location:'Detroit, MI',        descriptor:'Neon reflections' } },
  { id:'11', url:deadfile, ratio:'1/1',  category:'Abstract',     prominentColor:'#2563eb', meta:{ camera:'Sony A7IV', lens:'100mm macro',focalLength:'100mm', iso:640,  date:'2024-01-08', location:'Studio',             descriptor:'Water droplet study' } },
  { id:'12', url:deadfile, ratio:'4/3',  category:'Portrait',     prominentColor:'#f97316', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4', focalLength:'85mm',  iso:400,  date:'2023-12-24', location:'Ann Arbor, MI',      descriptor:'Winter light' } },
  { id:'13', url:deadfile, ratio:'2/3',  category:'Landscape',    prominentColor:'#16a34a', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8', focalLength:'24mm',  iso:100,  date:'2023-11-10', location:'Porcupine Mtns, MI',  descriptor:'Autumn ridge' } },
  { id:'14', url:deadfile, ratio:'3/4',  category:'Street',       prominentColor:'#1c1917', meta:{ camera:'Sony A7IV', lens:'35mm f/2',   focalLength:'35mm',  iso:2500, date:'2023-10-05', location:'New York, NY',        descriptor:'Subway platform' } },
  { id:'15', url:deadfile, ratio:'1/1',  category:'Abstract',     prominentColor:'#dc2626', meta:{ camera:'Sony A7IV', lens:'100mm macro',focalLength:'100mm', iso:200,  date:'2023-09-18', location:'Studio',              descriptor:'Flame study' } },
  { id:'16', url:deadfile, ratio:'16/9', category:'Landscape',    prominentColor:'#ca8a04', meta:{ camera:'Sony A7IV', lens:'16mm f/2.8', focalLength:'16mm',  iso:100,  date:'2023-08-22', location:'Dunes, MI',           descriptor:'Golden hour sand' } },
  { id:'17', url:deadfile, ratio:'4/5',  category:'Portrait',     prominentColor:'#7c3aed', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4', focalLength:'85mm',  iso:1600, date:'2023-07-14', location:'Detroit, MI',         descriptor:'Stage lights' } },
  { id:'18', url:deadfile, ratio:'3/2',  category:'Animal',       prominentColor:'#0891b2', meta:{ camera:'Sony A7IV', lens:'400mm f/5.6',focalLength:'400mm', iso:3200, date:'2023-06-01', location:'Lake Erie',            descriptor:'Heron at dawn' } },
  { id:'19', url:deadfile, ratio:'2/3',  category:'Architecture', prominentColor:'#e4e4e7', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8', focalLength:'24mm',  iso:100,  date:'2023-05-09', location:'Chicago, IL',         descriptor:'Glass tower' } },
  { id:'20', url:deadfile, ratio:'1/1',  category:'Street',       prominentColor:'#f97316', meta:{ camera:'Sony A7IV', lens:'35mm f/2',   focalLength:'35mm',  iso:800,  date:'2023-04-17', location:'Ann Arbor, MI',       descriptor:'Farmers market' } },
  { id:'21', url:deadfile, ratio:'4/3',  category:'Landscape',    prominentColor:'#2563eb', meta:{ camera:'Sony A7IV', lens:'50mm f/1.2', focalLength:'50mm',  iso:100,  date:'2023-03-30', location:'Lake Superior',        descriptor:'Ice shelf breakup' } },
  { id:'22', url:deadfile, ratio:'3/4',  category:'Portrait',     prominentColor:'#16a34a', meta:{ camera:'Sony A7IV', lens:'85mm f/1.4', focalLength:'85mm',  iso:400,  date:'2023-02-12', location:'Studio',              descriptor:'Environmental portrait' } },
  { id:'23', url:deadfile, ratio:'2/3',  category:'Abstract',     prominentColor:'#7c3aed', meta:{ camera:'Sony A7IV', lens:'100mm macro',focalLength:'100mm', iso:320,  date:'2023-01-25', location:'Studio',              descriptor:'Ink diffusion' } },
  { id:'24', url:deadfile, ratio:'16/9', category:'Animal',       prominentColor:'#ca8a04', meta:{ camera:'Sony A7IV', lens:'200mm f/4',  focalLength:'200mm', iso:1600, date:'2022-12-08', location:'UP, MI',              descriptor:'Deer in snow' } },
  { id:'25', url:deadfile, ratio:'4/5',  category:'Architecture', prominentColor:'#71717a', meta:{ camera:'Sony A7IV', lens:'35mm f/2',   focalLength:'35mm',  iso:100,  date:'2022-11-03', location:'Detroit, MI',         descriptor:'Abandoned factory' } },
  { id:'26', url:deadfile, ratio:'3/2',  category:'Street',       prominentColor:'#dc2626', meta:{ camera:'Sony A7IV', lens:'35mm f/2',   focalLength:'35mm',  iso:1250, date:'2022-10-19', location:'Chicago, IL',         descriptor:'Red line rush hour' } },
  { id:'27', url:deadfile, ratio:'1/1',  category:'Landscape',    prominentColor:'#0891b2', meta:{ camera:'Sony A7IV', lens:'24mm f/2.8', focalLength:'24mm',  iso:100,  date:'2022-09-07', location:'Apostle Islands, WI',  descriptor:'Sea cave reflection' } },
  { id:'28', url:deadfile, ratio:'2/3',  category:'Portrait',     prominentColor:'#1c1917', meta:{ camera:'Sony A7IV', lens:'50mm f/1.2', focalLength:'50mm',  iso:3200, date:'2022-08-14', location:'Detroit, MI',         descriptor:'Low key study' } },
  { id:'29', url:deadfile, ratio:'4/3',  category:'Animal',       prominentColor:'#16a34a', meta:{ camera:'Sony A7IV', lens:'400mm f/5.6',focalLength:'400mm', iso:800,  date:'2022-07-22', location:'Kalamazoo, MI',        descriptor:'Monarch on milkweed' } },
  { id:'30', url:deadfile, ratio:'3/4',  category:'Abstract',     prominentColor:'#f97316', meta:{ camera:'Sony A7IV', lens:'100mm macro',focalLength:'100mm', iso:640,  date:'2022-06-03', location:'Studio',              descriptor:'Rust texture' } },
]

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  if (max === min) return 0
  const d = max - min
  let h = 0
  if (max === r) h = ((g-b)/d + (g<b?6:0))/6
  else if (max === g) h = ((b-r)/d + 2)/6
  else h = ((r-g)/d + 4)/6
  return h * 360
}

function colorDistance(a: string, b: string): number {
  const p = (h: string, i: number) => parseInt(h.slice(1+i*2, 3+i*2), 16)
  return Math.sqrt([0,1,2].reduce((s,i) => s + (p(a,i)-p(b,i))**2, 0))
}

export default function Photos() {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState<Photo[]>(MOCK)
  const [category, setCategory] = useState('All')
  const [colorFilter, setColorFilter] = useState<string | null>(null)
  const [newestFirst, setNewestFirst] = useState(true)
  const [spectrumActive, setSpectrumActive] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPhotos().then(setPhotos).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = photos
    .filter(p => category === 'All' || p.category === category)
    .filter(p => !colorFilter || colorDistance(p.prominentColor, colorFilter) < 120)
    .sort((a, b) => {
      if (spectrumActive) {
        const hueDiff = hexToHue(a.prominentColor) - hexToHue(b.prominentColor)
        if (Math.abs(hueDiff) > 10) return hueDiff
      }
      const da = new Date(a.meta.date).getTime()
      const db = new Date(b.meta.date).getTime()
      return newestFirst ? db - da : da - db
    })

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-500">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-10 py-3 flex items-center gap-3 flex-wrap transition-colors duration-500">

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex-shrink-0 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Home
        </button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 flex-shrink-0" />

        {/* Category dropdown */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors cursor-pointer"
          >
            {category}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 py-1 min-w-36 overflow-hidden">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setDropdownOpen(false) }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                    category === c
                      ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Newest / Oldest toggle */}
        <div className="flex-shrink-0 flex rounded-full border border-zinc-200 dark:border-zinc-700 overflow-hidden text-sm">
          {([['newest', true], ['oldest', false]] as [string, boolean][]).map(([label, val]) => (
            <button
              key={label}
              onClick={() => setNewestFirst(val)}
              className={`px-3 py-1.5 transition-colors cursor-pointer capitalize ${
                newestFirst === val
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Spectrum sort */}
        <button
          onClick={() => setSpectrumActive(v => !v)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm text-white transition-all cursor-pointer border-2 ${spectrumActive ? 'border-white shadow-lg scale-105' : 'border-transparent'}`}
          style={{ background: 'linear-gradient(to right, #dc2626, #f97316, #ca8a04, #16a34a, #0891b2, #2563eb, #7c3aed)' }}
        >
          Spectrum
        </button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 flex-shrink-0" />

        {/* Color swatches with neutral bg */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-2 flex-shrink-0">
          {COLOR_SWATCHES.map(s => (
            <button
              key={s.label}
              title={s.label}
              onClick={() => setColorFilter(colorFilter === s.hex ? null : s.hex)}
              className="w-4 h-4 rounded-full transition-all cursor-pointer flex-shrink-0 border"
              style={{
                backgroundColor: s.hex,
                borderColor: colorFilter === s.hex ? '#6366f1' : 'rgba(0,0,0,0.15)',
                boxShadow: colorFilter === s.hex ? '0 0 0 2px #6366f1' : 'none',
              }}
            />
          ))}
          {colorFilter && (
            <button onClick={() => setColorFilter(null)} className="text-[0.6rem] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-0.5 cursor-pointer">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 px-20 py-8">
        {filtered.map(photo => (
          <div
            key={photo.id}
            className="break-inside-avoid mb-4 cursor-pointer"
            onMouseEnter={() => setHovered(photo.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-full rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 relative"
              style={{ aspectRatio: photo.ratio }}
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full border border-white/50 shadow" style={{ backgroundColor: photo.prominentColor }} />
              {hovered === photo.id && (
                <div className="absolute inset-0 bg-black/60 p-3 flex flex-col justify-end gap-0.5">
                  <p className="text-white text-xs font-medium leading-tight">{photo.meta.descriptor}</p>
                  <p className="text-white/60 text-[0.6rem]">{photo.meta.location} · {photo.meta.date}</p>
                  <p className="text-white/60 text-[0.6rem]">{photo.meta.camera} · {photo.meta.lens}</p>
                  <p className="text-white/60 text-[0.6rem]">{photo.meta.focalLength} · ISO {photo.meta.iso}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
