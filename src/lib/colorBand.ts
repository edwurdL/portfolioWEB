// The color bands behind the gallery's swatch filter. Must match swatchFor in
// portfolioAPI/src/lib/colors.ts, which uses the same bands to pick each photo's colors.

/** [hue upper bound in degrees, swatch]. Red wraps around both ends. */
const HUE_BANDS: [number, string][] = [
  [15, '#dc2626'], [40, '#f97316'], [65, '#ca8a04'], [170, '#16a34a'],
  [200, '#0891b2'], [255, '#2563eb'], [330, '#7c3aed'], [360, '#dc2626'],
]

/** The swatch whose band a color falls in, so filtering by Green catches every green. */
export function bandOf(hex: string): string {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  const s = max ? d / max : 0
  const v = max / 255
  if (v < 0.25) return '#1c1917' // Dark
  if (s < 0.25) return v > 0.8 ? '#e4e4e7' : '#71717a' // Light : Neutral
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return HUE_BANDS.find(([top]) => h * 60 < top)![1]
}
