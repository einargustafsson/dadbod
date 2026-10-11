import { describe, expect, it } from 'vitest'
import { assessRate, movingAverage, weeklyRate, weeksToGoal } from './trend'

const pts = (kgs: number[]) => kgs.map((kg, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, kg }))

describe('trend', () => {
  it('averages within a 7-day window', () => {
    const t = movingAverage(pts([92, 91, 93]), 7)
    expect(t[2].trend).toBeCloseTo(92, 5)
    expect(t[0].trend).toBe(92)
  })
  it('only uses points inside the window', () => {
    const t = movingAverage([{ date: '2026-10-01', kg: 100 }, { date: '2026-10-20', kg: 90 }])
    expect(t[1].trend).toBe(90)
  })
  it('needs a week of data for a rate', () => {
    expect(weeklyRate(movingAverage(pts([92, 91.9, 91.8])))).toBeNull()
  })
  it('computes kg/week on the trend line', () => {
    const kgs = Array.from({ length: 15 }, (_, i) => 92 - i * 0.1)
    const rate = weeklyRate(movingAverage(pts(kgs)))!
    expect(rate).toBeCloseTo(-0.7, 1)
  })
  it('classifies the rate', () => {
    expect(assessRate(null, 92)).toBe('insufficient-data')
    expect(assessRate(-0.5, 92)).toBe('on-track')
    expect(assessRate(-0.1, 92)).toBe('slow')
    expect(assessRate(0.2, 92)).toBe('slow')
    expect(assessRate(-1.2, 92)).toBe('too-fast')
  })
  it('estimates weeks to goal', () => {
    expect(weeksToGoal(92, 85, -0.5)).toBe(14)
    expect(weeksToGoal(84, 85, -0.5)).toBe(0)
    expect(weeksToGoal(92, 85, 0.1)).toBeNull()
  })
})
