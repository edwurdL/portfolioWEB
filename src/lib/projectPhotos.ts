// Project photos live in src/assets/projects/<folder>/. A project post places
// any file from its folder by name via projectPhoto().
const PROJECT_PHOTOS = import.meta.glob(
  '../assets/projects/*/*.{png,jpg,jpeg,webp,avif,gif,svg}',
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>

/** One named photo from a project's folder, or undefined if it isn't there. */
export function projectPhoto(folder: string, file: string): string | undefined {
  return PROJECT_PHOTOS[`../assets/projects/${folder}/${file}`]
}
