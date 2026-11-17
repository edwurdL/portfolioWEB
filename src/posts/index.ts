import type { ComponentType } from 'react'
import RobotControlsLibrary from './RobotControlsLibrary'
import Cr10Upgrade from './Cr10Upgrade'
import MedicalCensusDashboard from './MedicalCensusDashboard'
import Esp32SensorCoprocessor from './Esp32SensorCoprocessor'
import VexRobotStructures from './VexRobotStructures'
import LeapHandRl from './LeapHandRl'
import CustomOmniWheels from './CustomOmniWheels'

/**
 * Projects that open as their own page at /projects/<slug> instead of the
 * detail modal. `projectId` matches the entry's id in pages/Projects.tsx,
 * which supplies the title, date, status, tags and links shown above the body.
 * Each slug matches the project's photo folder in src/assets/projects/.
 */
export interface Post {
  slug: string
  projectId: string
  Body: ComponentType
}

export const POSTS: Post[] = [
  { slug: 'robot-controls-library',   projectId: '10', Body: RobotControlsLibrary },
  { slug: 'medical-census-dashboard', projectId: '2',  Body: MedicalCensusDashboard },
  { slug: 'esp32-sensor-coprocessor', projectId: '3',  Body: Esp32SensorCoprocessor },
  { slug: 'vex-robot-structures',     projectId: '4',  Body: VexRobotStructures },
  { slug: 'custom-omni-wheels',       projectId: '12', Body: CustomOmniWheels },
  { slug: 'leap-hand-rl',             projectId: '11', Body: LeapHandRl },
  { slug: 'cr10-upgrade',             projectId: '9',  Body: Cr10Upgrade },
]

export function postForProject(projectId: string): Post | undefined {
  return POSTS.find(p => p.projectId === projectId)
}

export function postBySlug(slug: string): Post | undefined {
  return POSTS.find(p => p.slug === slug)
}
