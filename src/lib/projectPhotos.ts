// Project photos live in src/assets/projects/<folder>/. The modal shows up to
// two of them via photosFor(); a project post can place any file in its folder
// by name via projectPhoto().
const PROJECT_PHOTOS = import.meta.glob(
  '../assets/projects/*/*.{png,jpg,jpeg,webp,avif,gif,svg}',
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>

const MAX_PHOTOS = 2

export function photosFor(folder: string): string[] {
  const prefix = `../assets/projects/${folder}/`
  const files = Object.keys(PROJECT_PHOTOS).filter(path => path.startsWith(prefix)).sort()
  if (import.meta.env.DEV && files.length > MAX_PHOTOS) {
    console.warn(`[projects] ${folder}/ holds ${files.length} photos — only the first ${MAX_PHOTOS} are shown.`)
  }
  return files.slice(0, MAX_PHOTOS).map(path => PROJECT_PHOTOS[path])
}

/** One named photo from a project's folder, or undefined if it isn't there. */
export function projectPhoto(folder: string, file: string): string | undefined {
  return PROJECT_PHOTOS[`../assets/projects/${folder}/${file}`]
}
