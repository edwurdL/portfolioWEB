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
  fullDesc?: string
  tags?: string[]
  status?: ProjectStatus
  repoUrl?: string
  liveUrl?: string
  /** Screenshots for the detail modal — files live in src/assets/projects/. */
  images?: string[]
  /**
   * Set for class assignments, e.g. 'EECS 482'. The card is then labelled as
   * coursework and links to that course on the Coursework page.
   */
  course?: string
}

/** A Projects page entry: every field filled in except the optional course. */
export type ProjectEntry = Required<Omit<Project, 'course'>> & Pick<Project, 'course'>

export function createProject(p: Partial<Project> & { id: string }): ProjectEntry {
  return {
    id:        p.id,
    title:     p.title     ?? 'Untitled',
    category:  p.category  ?? 'software',
    date:      p.date      ?? 'N/A',
    shortDesc: p.shortDesc ?? 'N/A',
    fullDesc:  p.fullDesc  ?? 'N/A',
    tags:      p.tags      ?? [],
    status:    p.status    ?? 'completed',
    repoUrl:   p.repoUrl   ?? '',
    liveUrl:   p.liveUrl   ?? '',
    images:    p.images    ?? [],
    course:    p.course,
  }
}

export function createPhoto(photo: Partial<Photo> & { id: string }): Required<Photo> {
  return {
    id:             photo.id,
    url:            photo.url            ?? '',
    ratio:          photo.ratio          ?? '1/1',
    category:       photo.category       ?? 'Uncategorized',
    prominentColor: photo.prominentColor ?? '#71717a',
    meta:           createPhotoMeta(photo.meta),
  }
}
