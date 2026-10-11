export type BodyRegion = 'upper' | 'lower'
export type Pattern =
  | 'squat' | 'hinge' | 'single-leg' | 'calf' | 'core'
  | 'h-push' | 'h-pull' | 'v-push' | 'v-pull' | 'arms' | 'shoulder-health'
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight'

export interface Exercise {
  id: string
  name: string
  pattern: Pattern
  region: BodyRegion
  equipment: Equipment
  isCompound: boolean
  repMin: number
  repMax: number
  startingWeight: number // kg, 0 = bodyweight / user-entered
  increment: number // kg
}

export type SessionType = 'upper' | 'lower'
export type SessionStatus = 'planned' | 'in-progress' | 'done'

export interface Session {
  id?: number
  date: string // ISO date
  type: SessionType
  status: SessionStatus
  deload: boolean
  exerciseIds: string[]
  warmupIds: string[]
  finisherIds: string[]
}

export interface SetLog {
  id?: number
  sessionId: number
  exerciseId: string
  setNumber: number
  targetReps: number
  targetWeight: number
  actualReps?: number
  actualWeight?: number
  rpe?: number
}

export interface BodyWeight { date: string; kg: number }
export interface Run {
  id?: number
  date: string
  distanceKm: number
  durationMin: number
  effort: 1 | 2 | 3 | 4 | 5
}

export interface Ride {
  id?: number
  date: string
  distanceKm: number
  durationMin: number
  effort: 1 | 2 | 3 | 4 | 5
}

export interface MobilityMove {
  id: string
  name: string
  kind: 'warmup' | 'finisher'
  focus: 'hips' | 'thoracic' | 'shoulders' | 'balance' | 'grip-carry'
  cue: string
  seconds: number
}

export interface Settings {
  id: 'main'
  startWeight: number
  goalWeight: number
  setsPerExercise: number
  excludedExerciseIds: string[]
  disabledEquipment: Equipment[]
  startingWeights: Record<string, number> // user-entered overrides
  videoUrls?: Record<string, string> // user's preferred demo link per exercise id
  deloadStartDate?: string
  claudeKey?: string
}
