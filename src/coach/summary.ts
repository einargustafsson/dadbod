import { EXERCISE_BY_ID } from '../db/seed/exercises'
import { daysBetween, weekStart } from '../engine/dates'
import { e1rm, isStalled, type ExercisePerformance } from '../engine/progress'
import { assessRate, movingAverage, weeklyRate, type RateStatus } from '../engine/trend'
import type { BodyWeight, Ride, Run, Session, SetLog, Settings } from '../types'

const WINDOW_DAYS = 28

export interface CoachSummary {
  today: string
  windowDays: number
  goal: { startKg: number; goalKg: number; currentTrendKg: number | null; trendKgPerWeek: number | null; rateStatus: RateStatus }
  training: {
    sessionsInWindow: number
    deloadSessions: number
    lifts: { name: string; sessions: number; firstE1rmKg: number; lastE1rmKg: number; stalled: boolean }[]
  }
  running: { weeklyKm: { weekStarting: string; km: number }[] }
  cycling: { weeklyKm: { weekStarting: string; km: number }[] }
}

export interface SummaryInput {
  today: string
  sessions: Session[]
  sets: SetLog[]
  bodyWeights: BodyWeight[]
  runs: Run[]
  rides: Ride[]
  settings: Settings
}

const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * Compact, aggregate-only view of the last four weeks. This is the only data sent to the
 * Claude API: no notes, no API key, no raw per-set rows, no personal identifiers.
 */
export function buildSummary({ today, sessions, sets, bodyWeights, runs, rides, settings }: SummaryInput): CoachSummary {
  const inWindow = (date: string) => daysBetween(date, today) >= 0 && daysBetween(date, today) < WINDOW_DAYS

  const trend = movingAverage(bodyWeights)
  const latest = trend[trend.length - 1]
  const rate = weeklyRate(trend)

  const done = sessions.filter((s) => s.status === 'done' && inWindow(s.date))
  const dateOf = new Map(done.map((s) => [s.id!, s.date]))

  // Per exercise: per-session performance (oldest first) and best e1RM per session.
  const perEx = new Map<string, Map<number, SetLog[]>>()
  for (const s of sets) {
    if (!dateOf.has(s.sessionId) || s.actualReps === undefined || s.actualWeight === undefined) continue
    const m = perEx.get(s.exerciseId) ?? new Map<number, SetLog[]>()
    m.set(s.sessionId, [...(m.get(s.sessionId) ?? []), s])
    perEx.set(s.exerciseId, m)
  }

  const lifts = [...perEx].map(([exId, bySession]) => {
    const ordered = [...bySession].sort(([a], [b]) => dateOf.get(a)!.localeCompare(dateOf.get(b)!) || a - b)
    const best = ordered.map(([, rows]) => Math.max(...rows.map((r) => e1rm(r.actualWeight!, r.actualReps!))))
    const history: ExercisePerformance[] = [...ordered].reverse().map(([, rows]) => ({
      targetReps: rows[0].targetReps,
      targetWeight: rows[0].targetWeight,
      sets: rows.map((r) => ({ actualReps: r.actualReps!, actualWeight: r.actualWeight!, rpe: r.rpe })),
    }))
    return {
      name: EXERCISE_BY_ID[exId]?.name ?? exId,
      sessions: ordered.length,
      firstE1rmKg: round1(best[0]),
      lastE1rmKg: round1(best[best.length - 1]),
      stalled: isStalled(history),
    }
  }).sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name))

  const weeklyKm = (entries: { date: string; distanceKm: number }[]) => {
    const km = new Map<string, number>()
    for (const r of entries.filter((r) => inWindow(r.date))) {
      km.set(weekStart(r.date), (km.get(weekStart(r.date)) ?? 0) + r.distanceKm)
    }
    return [...km].sort().map(([weekStarting, k]) => ({ weekStarting, km: round1(k) }))
  }

  return {
    today,
    windowDays: WINDOW_DAYS,
    goal: {
      startKg: settings.startWeight,
      goalKg: settings.goalWeight,
      currentTrendKg: latest ? round1(latest.trend) : null,
      trendKgPerWeek: rate === null ? null : Math.round(rate * 100) / 100,
      rateStatus: latest ? assessRate(rate, latest.kg) : 'insufficient-data',
    },
    training: {
      sessionsInWindow: done.length,
      deloadSessions: done.filter((s) => s.deload).length,
      lifts,
    },
    running: { weeklyKm: weeklyKm(runs) },
    cycling: { weeklyKm: weeklyKm(rides) },
  }
}
