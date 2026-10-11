import type { Exercise } from '../types'
import { roundTo } from './dates'

/** Result of one finished session for one exercise. */
export interface ExercisePerformance {
  targetReps: number
  targetWeight: number
  sets: { actualReps: number; actualWeight: number; rpe?: number }[]
}

export interface Target {
  weight: number
  reps: number
  /** Consecutive sessions at the current weight that missed their rep target. */
  stalls: number
}

const MAX_RPE_TO_PROGRESS = 8
const STALLS_BEFORE_DROP = 2
const DROP_FACTOR = 0.9

/** Epley estimated one-rep max. */
export function e1rm(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  return reps === 1 ? weight : weight * (1 + reps / 30)
}

function hitTargetReps(p: ExercisePerformance): boolean {
  return p.sets.length > 0 && p.sets.every((s) => s.actualReps >= p.targetReps && s.actualWeight >= p.targetWeight)
}

function hitTopOfRange(p: ExercisePerformance, ex: Exercise): boolean {
  return (
    hitTargetReps(p) &&
    p.sets.every((s) => s.actualReps >= ex.repMax && (s.rpe === undefined || s.rpe <= MAX_RPE_TO_PROGRESS))
  )
}

/**
 * Double progression. `history` is most recent first, completed sessions only.
 * No history: start at the user's entered weight and the bottom of the rep range.
 */
export function nextTarget(ex: Exercise, history: ExercisePerformance[], startWeight: number): Target {
  if (history.length === 0) return { weight: startWeight, reps: ex.repMin, stalls: 0 }

  const last = history[0]
  const weight = last.targetWeight

  let stalls = 0
  for (const h of history) {
    if (h.targetWeight !== weight || hitTargetReps(h)) break
    stalls++
  }

  if (stalls >= STALLS_BEFORE_DROP) {
    return { weight: Math.max(0, roundTo(weight * DROP_FACTOR, ex.increment)), reps: ex.repMin, stalls: 0 }
  }
  if (hitTopOfRange(last, ex)) return { weight: weight + ex.increment, reps: ex.repMin, stalls: 0 }
  if (hitTargetReps(last)) return { weight, reps: Math.min(ex.repMax, last.targetReps + 1), stalls: 0 }
  return { weight, reps: last.targetReps, stalls }
}

/** True when the last two sessions for this exercise both missed their targets. */
export function isStalled(history: ExercisePerformance[]): boolean {
  return history.length >= 2 && !hitTargetReps(history[0]) && !hitTargetReps(history[1])
}

/**
 * Sets are prescribed with a 0 kg target until the user enters a first weight. Treat the
 * heaviest logged weight as the target in that case so progression has a base to build on.
 */
export function effectiveTargetWeight(targetWeight: number, actualWeights: number[]): number {
  return targetWeight === 0 && actualWeights.length ? Math.max(...actualWeights) : targetWeight
}
