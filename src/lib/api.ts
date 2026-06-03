import type { Photo, Project } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function fetchPhotos(): Promise<Photo[]> {
  return fetchJSON<Photo[]>('/photos');
}

export function fetchProjects(limit = 5, offset = 0): Promise<Project[]> {
  return fetchJSON<Project[]>(`/projects?limit=${limit}&offset=${offset}`);
}
