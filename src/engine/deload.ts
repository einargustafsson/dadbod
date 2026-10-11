import type { Session } from '../types'

/** ~4 loading weeks at 3 lifts a week, then a deload week. */
export const SESSIONS_BETWEEN_DELOADS = 12
export const DELOAD_SESSIONS = 3
export const STALLED_EXERCISES_FOR_EARLY_DELOAD = 3
export const DELOAD_VOLUME_FACTOR = 0.6
export const DELOAD_WEIGHT_FACTOR = 0.9

export interface DeloadDecision {
  deload: boolean
  reason: string
}

/**
 * Session-count based so missed weeks don't skew the cycle. `stalledCount` is the number
 * of exercises with 2+ consecutive stalls over the past two weeks.
 */
export function deloadDecision(sessions: Session[], stalledCount: number): DeloadDecision {
  const done = sessions
    .filter((s) => s.status === 'done')
    .sort((a, b) => b.date.localeCompare(a.date) || (b.id ?? 0) - (a.id ?? 0))

  let deloads = 0
  while (deloads < done.length && done[deloads].deload) deloads++
  if (deloads > 0 && deloads < DELOAD_SESSIONS) {
    return { deload: true, reason: `Deload week in progress (${deloads}/${DELOAD_SESSIONS})` }
  }

  let normal = 0
  if (deloads === 0) {
    while (normal < done.length && !done[normal].deload) normal++
  }
  if (normal >= SESSIONS_BETWEEN_DELOADS) {
    return { deload: true, reason: `${normal} loading sessions since last deload` }
  }
  if (deloads === 0 && stalledCount >= STALLED_EXERCISES_FOR_EARLY_DELOAD) {
    return { deload: true, reason: `${stalledCount} lifts stalled, early deload` }
  }
  return { deload: false, reason: '' }
}
