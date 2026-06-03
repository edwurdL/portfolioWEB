import { useNavigate } from 'react-router-dom'
import { useDevice, DEVICE_CONFIG } from '../hooks/useDevice'

export default function Coursework() {
  const navigate = useNavigate()
  const cfg = DEVICE_CONFIG[useDevice()]

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-500">
      <div
        className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 py-3 flex items-center gap-3 flex-wrap transition-colors duration-500"
        style={{ paddingLeft: cfg.photoHeaderPx, paddingRight: cfg.photoHeaderPx }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex-shrink-0 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Home
        </button>
      </div>
    </div>
  )
}
