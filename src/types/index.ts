export interface SiteAnalytics {
  uniqueUsers: number
  apiRequests: number
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

export type ProjectStatus = 'completed' | 'in-progress' | 'archived'

export interface Project {
  id: string
  title?: string
  date?: string
  shortDesc?: string
  fullDesc?: string
  tags?: string[]
  status?: ProjectStatus
  repoUrl?: string
  liveUrl?: string
}

export function createProject(p: Partial<Project> & { id: string }): Required<Project> {
  return {
    id:        p.id,
    title:     p.title     ?? 'Untitled',
    date:      p.date      ?? 'N/A',
    shortDesc: p.shortDesc ?? 'N/A',
    fullDesc:  p.fullDesc  ?? 'N/A',
    tags:      p.tags      ?? [],
    status:    p.status    ?? 'completed',
    repoUrl:   p.repoUrl   ?? '',
    liveUrl:   p.liveUrl   ?? '',
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
