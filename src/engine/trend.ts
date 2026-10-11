import type { BodyWeight } from '../types'
import { daysBetween } from './dates'

export interface TrendPoint { date: string; kg: number; trend: number }

export type RateStatus = 'on-track' | 'slow' | 'too-fast' | 'insufficient-data'

export const TARGET_LOSS_KG_PER_WEEK = 0.5
const MAX_LOSS_FRACTION_PER_WEEK = 0.01

/** Trailing average over the previous `windowDays` days (inclusive of the point itself). */
export function movingAverage(points: BodyWeight[], windowDays = 7): TrendPoint[] {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.map((p) => {
    const win = sorted.filter((q) => {
      const age = daysBetween(q.date, p.date)
      return age >= 0 && age < windowDays
    })
    const trend = win.reduce((s, q) => s + q.kg, 0) / win.length
    return { date: p.date, kg: p.kg, trend }
  })
}

/** kg/week change of the trend line (negative = losing), needs at least 7 days of data. */
export function weeklyRate(trend: TrendPoint[]): number | null {
  if (trend.length < 2) return null
  const last = trend[trend.length - 1]
  const earlier = [...trend].reverse().find((p) => daysBetween(p.date, last.date) >= 7)
  if (!earlier) return null
  const days = daysBetween(earlier.date, last.date)
  return ((last.trend - earlier.trend) / days) * 7
}

export function assessRate(rateKgPerWeek: number | null, currentKg: number): RateStatus {
  if (rateKgPerWeek === null) return 'insufficient-data'
  const loss = -rateKgPerWeek
  if (loss > currentKg * MAX_LOSS_FRACTION_PER_WEEK) return 'too-fast'
  if (loss < TARGET_LOSS_KG_PER_WEEK / 2) return 'slow'
  return 'on-track'
}

export function weeksToGoal(currentKg: number, goalKg: number, rateKgPerWeek: number | null): number | null {
  if (currentKg <= goalKg) return 0
  if (rateKgPerWeek === null || rateKgPerWeek >= 0) return null
  return (currentKg - goalKg) / -rateKgPerWeek
}
