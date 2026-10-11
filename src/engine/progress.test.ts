import { describe, expect, it } from 'vitest'
import { EXERCISE_BY_ID } from '../db/seed/exercises'
import { e1rm, nextTarget, type ExercisePerformance } from './progress'

const ex = EXERCISE_BY_ID['bench'] // 5-8 reps, +2.5 kg
const perf = (weight: number, targetReps: number, reps: number[], rpe?: number): ExercisePerformance => ({
  targetReps, targetWeight: weight,
  sets: reps.map((r) => ({ actualReps: r, actualWeight: weight, rpe })),
})

describe('nextTarget', () => {
  it('uses the entered start weight with no history', () => {
    expect(nextTarget(ex, [], 60)).toEqual({ weight: 60, reps: 5, stalls: 0 })
  })
  it('adds a rep when targets are hit below the top of the range', () => {
    expect(nextTarget(ex, [perf(60, 5, [5, 5, 5])], 60)).toMatchObject({ weight: 60, reps: 6 })
  })
  it('adds weight and resets reps after hitting the top at RPE <= 8', () => {
    expect(nextTarget(ex, [perf(60, 8, [8, 8, 8], 8)], 60)).toMatchObject({ weight: 62.5, reps: 5 })
  })
  it('holds at the top of the range when RPE was too high', () => {
    expect(nextTarget(ex, [perf(60, 8, [8, 8, 8], 9)], 60)).toMatchObject({ weight: 60, reps: 8 })
  })
  it('holds on a miss and counts a stall', () => {
    expect(nextTarget(ex, [perf(60, 6, [6, 5, 4])], 60)).toEqual({ weight: 60, reps: 6, stalls: 1 })
  })
  it('drops about 10% after two consecutive stalls at the same weight', () => {
    const history = [perf(60, 6, [5, 5, 4]), perf(60, 6, [6, 5, 4])]
    expect(nextTarget(ex, history, 60)).toEqual({ weight: 55, reps: 5, stalls: 0 })
  })
  it('does not count stalls across a weight change', () => {
    const history = [perf(62.5, 5, [4, 4, 4]), perf(60, 8, [6, 5, 5])]
    expect(nextTarget(ex, history, 60).stalls).toBe(1)
  })
})

describe('e1rm', () => {
  it('uses Epley', () => {
    expect(e1rm(100, 5)).toBeCloseTo(116.67, 1)
    expect(e1rm(100, 1)).toBe(100)
    expect(e1rm(0, 5)).toBe(0)
  })
})
