import type { Run, Session, SessionType } from '../types'
import { daysBetween } from './dates'

export interface NextSession {
  type: SessionType
  /** True when a lower session follows a hard run and volume should be trimmed. */
  reducedVolume: boolean
  reason: string
}

export function isHardRun(run: Run): boolean {
  return run.distanceKm > 10 || run.effort >= 4
}

/**
 * Alternates upper/lower from the last completed session. If a hard run was logged in
 * the last 48h, a lower day is swapped for upper, unless the last two sessions were
 * both upper, in which case lower stays but with reduced volume.
 */
export function nextSession(sessions: Session[], runs: Run[], today: string): NextSession {
  const done = sessions
    .filter((s) => s.status === 'done')
    .sort((a, b) => b.date.localeCompare(a.date) || (b.id ?? 0) - (a.id ?? 0))

  const alternate: SessionType = done.length === 0 || done[0].type === 'lower' ? 'upper' : 'lower'
  if (alternate === 'upper') {
    return { type: 'upper', reducedVolume: false, reason: done.length ? 'Alternating from lower' : 'First session' }
  }

  const hardRecentRun = runs.some((r) => {
    const age = daysBetween(r.date, today)
    return age >= 0 && age <= 2 && isHardRun(r)
  })
  if (!hardRecentRun) return { type: 'lower', reducedVolume: false, reason: 'Alternating from upper' }

  const lastTwoUpper = done.length >= 2 && done[0].type === 'upper' && done[1].type === 'upper'
  if (lastTwoUpper) {
    return { type: 'lower', reducedVolume: true, reason: 'Hard run in last 48h, lower volume reduced' }
  }
  return { type: 'upper', reducedVolume: false, reason: 'Hard run in last 48h, legs saved for later' }
}
