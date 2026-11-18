/** Last-24h zone traffic, proxied from Cloudflare by GET /api/analytics. */
export interface SiteAnalytics {
  uniqueVisitors: number
  totalRequests: number
  totalBytes: number
  since: string
  until: string
}

export interface PhotoMeta {
  camera?: string
  lens?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: number | string
  date?: string
  location?: string
  descriptor?: string
}

export interface Photo {
  id: string
  url?: string
  ratio?: string
  category?: string
  prominentColor?: string
  /** Unsnapped mean colour of the frame, for the RGB plot. */
  avgColor?: string
  meta?: PhotoMeta
}

export function createPhotoMeta(meta: PhotoMeta = {}): Required<PhotoMeta> {
  return {
    camera:      meta.camera      ?? 'N/A',
    lens:        meta.lens        ?? 'N/A',
    focalLength:  meta.focalLength  ?? 'N/A',
    aperture:     meta.aperture     ?? 'N/A',
    shutterSpeed: meta.shutterSpeed ?? 'N/A',
    iso:          meta.iso          ?? 'N/A',
    date:        meta.date        ?? 'N/A',
    location:    meta.location    ?? 'N/A',
    descriptor:  meta.descriptor  ?? 'N/A',
  }
}

export type ProjectStatus = 'completed' | 'in-progress' | 'deployed' | 'archived'

/** Which filter on the Projects page a project falls under. */
export type ProjectCategory = 'robotics' | 'software'

export interface Project {
  id: string
  title?: string
  category?: ProjectCategory
  date?: string
  shortDesc?: string
  tags?: string[]
  status?: ProjectStatus
  repoUrl?: string
  liveUrl?: string
  /**
   * Set for class assignments, e.g. 'EECS 482'. The card is then labelled as
   * coursework and links to that course on the Coursework page.
   */
  course?: string
  /** A small icon shown right after the title, e.g. the project's own favicon. */
  icon?: string
  /** The card's picture on the Projects page, from the project's photo folder. */
  cover?: string
  /** A short animated clip shown instead of the cover; the cover is then its still frame. */
  animated?: string
}

/** A Projects page entry: every field filled in except the optional course, icon and cover. */
export type ProjectEntry = Required<Omit<Project, 'course' | 'icon' | 'cover' | 'animated'>> & Pick<Project, 'course' | 'icon' | 'cover' | 'animated'>

export function createPhoto(photo: Partial<Photo> & { id: string }): Required<Photo> {
  return {
    id:             photo.id,
    url:            photo.url            ?? '',
    ratio:          photo.ratio          ?? '1/1',
    category:       photo.category       ?? 'Uncategorized',
    prominentColor: photo.prominentColor ?? '#71717a',
    avgColor:       photo.avgColor ?? photo.prominentColor ?? '#71717a',
    meta:           createPhotoMeta(photo.meta),
  }
}
