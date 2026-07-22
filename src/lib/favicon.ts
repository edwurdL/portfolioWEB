// Generates the "EL" monogram favicon as an inline SVG data-URI and swaps it
// to match the active theme. Dark mode → dark square / light letters; light
// mode → light square / dark letters. Called on load and whenever the `.dark`
// class on <html> changes.

function svg(dark: boolean): string {
  const bg = dark ? '#18181b' : '#fafafa'
  const fg = dark ? '#fafafa' : '#18181b'
  const stroke = dark ? '#3f3f46' : '#e4e4e7'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="2" y="2" width="60" height="60" rx="16" fill="${bg}" stroke="${stroke}" stroke-width="2"/>
    <text x="32" y="30" dominant-baseline="central" text-anchor="middle"
      font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700"
      textLength="46" lengthAdjust="spacingAndGlyphs" fill="${fg}">[EL]</text>
  </svg>`
}

function href(dark: boolean): string {
  return `data:image/svg+xml,${encodeURIComponent(svg(dark))}`
}

export function applyFavicon() {
  const dark = document.documentElement.classList.contains('dark')
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = 'image/svg+xml'
  link.href = href(dark)
}

export function watchFavicon(): () => void {
  applyFavicon()
  const mo = new MutationObserver(applyFavicon)
  mo.observe(document.documentElement, { attributeFilter: ['class'] })
  return () => mo.disconnect()
}
