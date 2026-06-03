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
    sectionPx:       '1.25rem',
    sectionPt:       '2rem',
    sectionPb:       '1rem',
    analyticsPx:     '1.25rem',
    photoHeaderPx:   '1.25rem',
    photoGridPx:     '1rem',
    photoColumns:    'columns-2',
    profileSize:     '5rem',
    navBoxPx:        '1.25rem',
    navBoxPy:        '1.25rem',
    navBoxImgSize:   '4rem',
    navBoxImgShow:   false,
    navBoxDir:       'column' as const,
    gap:             '0.625rem',
    fontSize: {
      name:    '1.75rem',
      bio:     '0.9rem',
      socials: '0.8rem',
      label:   '0.5rem',
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
    navBoxImgShow:  true,
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
