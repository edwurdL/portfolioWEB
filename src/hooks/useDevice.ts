import { useEffect, useState } from 'react'

export type Device = 'mobile' | 'desktop'

const BREAKPOINT = 768

function getDevice(): Device {
  return window.innerWidth < BREAKPOINT ? 'mobile' : 'desktop'
}

export function useDevice(): Device {
  const [device, setDevice] = useState<Device>(getDevice)

  useEffect(() => {
    const handler = () => setDevice(getDevice())
    window.addEventListener('resize', handler, { passive: true })
    return () => window.removeEventListener('resize', handler)
  }, [])

  return device
}

export const DEVICE_CONFIG = {
  mobile: {
    sectionPx:      '1rem',
    sectionPt:      '1.5rem',
    sectionPb:      '1rem',
    analyticsPx:    '1rem',
    photoHeaderPx:  '1rem',
    photoGridPx:    '1rem',
    photoColumns:   'columns-1 sm:columns-2',
    profileSize:    '4rem',
    navBoxPx:       '1rem',
    navBoxPy:       '1rem',
    navBoxImgSize:  '3rem',
    navBoxDir:      'column' as const,
    gap:            '0.5rem',
    fontSize: {
      name:    '1.75rem',
      bio:     '1rem',
      socials: '0.875rem',
      label:   '0.55rem',
    },
  },
  desktop: {
    sectionPx:      '3.75rem',
    sectionPt:      '8.75rem',
    sectionPb:      '2rem',
    analyticsPx:    '10rem',
    photoHeaderPx:  '2.5rem',
    photoGridPx:    '5rem',
    photoColumns:   'columns-2 md:columns-3 lg:columns-4',
    profileSize:    '12.5rem',
    navBoxPx:       '2rem',
    navBoxPy:       '3rem',
    navBoxImgSize:  '7rem',
    navBoxDir:      'row' as const,
    gap:            '1.25rem',
    fontSize: {
      name:    '2.25rem',
      bio:     '1.875rem',
      socials: '1.125rem',
      label:   '0.8rem',
    },
  },
}
