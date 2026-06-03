export interface SiteAnalytics {
  uniqueUsers: number
  apiRequests: number
}

export interface PhotoMeta {
  camera: string
  lens: string
  focalLength: string
  iso: number
  date: string
  location: string
  descriptor: string
}

export interface Photo {
  id: string
  url: string
  ratio: string
  category: string
  prominentColor: string
  meta: PhotoMeta
}
