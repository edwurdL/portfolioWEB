import type { Photo, Project, SiteAnalytics } from '../types'

// Photos are served by the self-hosted REST API. `url` fields come back as
// relative paths, so the base must be prepended to load the actual WebP files.
const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api.eddie-lai.com';

export async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

/** Raw photo shape returned by GET /api/photos. All EXIF fields are nullable. */
interface ApiPhoto {
  id: string
  filename: string
  url: string
  description: string | null
  category: string | null
  tags: string[]
  colors: string[]
  dateTaken: string | null
  camera: string | null
  iso: number | null
  shutter: string | null
  aperture: string | null
  lens: string | null
  focalLength: string | null
  createdAt: string
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Map an API photo onto the internal Photo shape the UI renders. */
function mapPhoto(p: ApiPhoto): Photo {
  return {
    id: p.id,
    // `url` is a relative path — prepend the API base to load the WebP.
    url: `${API_BASE}${p.url}`,
    category: p.category ? capitalize(p.category) : undefined,
    prominentColor: p.colors?.[0],
    meta: {
      camera: p.camera ?? undefined,
      lens: p.lens ?? undefined,
      focalLength: p.focalLength ?? undefined,
      aperture: p.aperture ?? undefined,
      shutterSpeed: p.shutter ?? undefined,
      iso: p.iso ?? undefined,
      date: p.dateTaken ? p.dateTaken.slice(0, 10) : undefined,
      descriptor: p.description ?? undefined,
    },
  }
}

export interface PhotoQuery {
  category?: string
  tag?: string
  color?: string
  sort?: 'date'
}

export async function fetchPhotos(params: PhotoQuery = {}): Promise<Photo[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  const data = await fetchJSON<ApiPhoto[]>(`/api/photos${qs ? `?${qs}` : ''}`)
  return data.map(mapPhoto)
}

// One fetch of the photo list per visit, shared by Home's preview card and the
// Photos page: whichever asks first starts it, and arriving on Photos from Home
// finds the list already in hand instead of showing skeletons again.
let photoList: Promise<Photo[]> | undefined
let photoListResult: Photo[] | undefined

export function loadPhotos(): Promise<Photo[]> {
  photoList ??= fetchPhotos().then(
    list => (photoListResult = list),
    err => {
      photoList = undefined // let the next caller retry
      throw err
    }
  )
  return photoList
}

/** The photo list if it has already arrived, without waiting. */
export function loadedPhotos(): Photo[] | undefined {
  return photoListResult
}

export function fetchProjects(limit = 5, offset = 0): Promise<Project[]> {
  return fetchJSON<Project[]>(`/api/projects?limit=${limit}&offset=${offset}`);
}

export function fetchAnalytics(): Promise<SiteAnalytics> {
  return fetchJSON<SiteAnalytics>('/api/analytics');
}
