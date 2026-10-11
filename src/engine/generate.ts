import type { Equipment, Exercise, Pattern, SessionType } from '../types'
import { roundTo } from './dates'
import { DELOAD_VOLUME_FACTOR, DELOAD_WEIGHT_FACTOR } from './deload'

export interface PlannedExercise {
  exercise: Exercise
  sets: number
  targetReps: number
  targetWeight: number
}

export interface GenerateInput {
  type: SessionType
  library: Exercise[]
  excludedIds: string[]
  disabledEquipment: Equipment[]
  /** Exercise ids used in the previous session of this type, avoided when alternatives exist. */
  lastSessionIds: string[]
  setsPerExercise: number
  deload: boolean
  reducedVolume: boolean
  getTarget: (ex: Exercise) => { weight: number; reps: number }
  rand?: () => number
}

interface Slot { pattern: Pattern; compound?: boolean }

const SLOTS: Record<SessionType, Slot[]> = {
  lower: [
    { pattern: 'squat' },
    { pattern: 'hinge', compound: true },
    { pattern: 'single-leg', compound: true },
    { pattern: 'single-leg', compound: false },
    { pattern: 'calf' },
    { pattern: 'core' },
  ],
  upper: [
    { pattern: 'h-push', compound: true },
    { pattern: 'h-pull' },
    { pattern: 'v-push' },
    { pattern: 'v-pull' },
    { pattern: 'shoulder-health' },
    { pattern: 'arms' },
  ],
}

function pick<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)]
}

export function generateWorkout(input: GenerateInput): PlannedExercise[] {
  const rand = input.rand ?? Math.random
  const region = input.type
  const available = input.library.filter(
    (e) =>
      e.region === region &&
      !input.excludedIds.includes(e.id) &&
      !input.disabledEquipment.includes(e.equipment),
  )

  const chosen: Exercise[] = []
  for (const slot of SLOTS[input.type]) {
    let pool = available.filter((e) => e.pattern === slot.pattern && !chosen.includes(e))
    if (slot.compound !== undefined) {
      const narrowed = pool.filter((e) => e.isCompound === slot.compound)
      if (narrowed.length) pool = narrowed
    }
    const fresh = pool.filter((e) => !input.lastSessionIds.includes(e.id))
    if (fresh.length) pool = fresh
    if (pool.length) chosen.push(pick(pool, rand))
  }

  // Compounds first, otherwise keep slot order.
  const ordered = [...chosen].sort((a, b) => Number(b.isCompound) - Number(a.isCompound))

  let sets = input.setsPerExercise
  if (input.reducedVolume) sets = Math.max(2, sets - 1)
  if (input.deload) sets = Math.max(2, Math.round(sets * DELOAD_VOLUME_FACTOR))

  return ordered.map((exercise) => {
    const t = input.getTarget(exercise)
    const weight = input.deload ? roundTo(t.weight * DELOAD_WEIGHT_FACTOR, exercise.increment) : t.weight
    return { exercise, sets, targetReps: t.reps, targetWeight: weight }
  })
}

/** Rough session length: ~3 min per set incl. rest, plus warm-up and finisher. */
export function estimateMinutes(plan: PlannedExercise[]): number {
  return plan.reduce((s, p) => s + p.sets * 3, 0) + 10
}
