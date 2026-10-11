import { describe, expect, it } from 'vitest'
import { EXERCISES, MOBILITY } from '../db/seed/exercises'
import { generateWorkout, type GenerateInput } from './generate'
import { pickMobility } from './mobility'

const base = (over: Partial<GenerateInput> = {}): GenerateInput => ({
  type: 'lower', library: EXERCISES, excludedIds: [], disabledEquipment: [], lastSessionIds: [],
  setsPerExercise: 3, deload: false, reducedVolume: false,
  getTarget: () => ({ weight: 50, reps: 5 }), ...over,
})

describe('generateWorkout', () => {
  it('builds 6 exercises covering the required lower patterns', () => {
    const plan = generateWorkout(base())
    const patterns = plan.map((p) => p.exercise.pattern)
    expect(plan).toHaveLength(6)
    for (const p of ['squat', 'hinge', 'single-leg', 'calf', 'core']) expect(patterns).toContain(p)
    expect(plan.every((p) => p.exercise.region === 'lower')).toBe(true)
  })
  it('builds upper sessions with push, pull and shoulder health', () => {
    const patterns = generateWorkout(base({ type: 'upper' })).map((p) => p.exercise.pattern)
    for (const p of ['h-push', 'h-pull', 'v-push', 'v-pull', 'shoulder-health', 'arms']) expect(patterns).toContain(p)
  })
  it('puts compounds first', () => {
    const plan = generateWorkout(base({ type: 'upper' }))
    const firstIso = plan.findIndex((p) => !p.exercise.isCompound)
    expect(plan.slice(firstIso).every((p) => !p.exercise.isCompound)).toBe(true)
  })
  it('honors exclusions and disabled equipment', () => {
    for (let i = 0; i < 30; i++) {
      const plan = generateWorkout(base({ excludedIds: ['back-squat'], disabledEquipment: ['barbell'] }))
      expect(plan.some((p) => p.exercise.equipment === 'barbell')).toBe(false)
    }
  })
  it('avoids repeating the previous session when alternatives exist', () => {
    const first = generateWorkout(base())
    const second = generateWorkout(base({ lastSessionIds: first.map((p) => p.exercise.id) }))
    expect(second.some((p) => first.some((f) => f.exercise.id === p.exercise.id))).toBe(false)
  })
  it('falls back to repeating when only one option exists', () => {
    const only = EXERCISES.filter((e) => e.id === 'back-squat' || e.region === 'upper')
    const plan = generateWorkout(base({ library: only, lastSessionIds: ['back-squat'] }))
    expect(plan.map((p) => p.exercise.id)).toEqual(['back-squat'])
  })
  it('cuts sets by one after a hard run, never below 2', () => {
    expect(generateWorkout(base({ reducedVolume: true }))[0].sets).toBe(2)
    expect(generateWorkout(base({ reducedVolume: true, setsPerExercise: 2 }))[0].sets).toBe(2)
  })
  it('deload cuts volume to ~60% and weight by 10%', () => {
    const [first] = generateWorkout(base({ deload: true, getTarget: () => ({ weight: 100, reps: 5 }) }))
    expect(first.sets).toBe(2)
    expect(first.targetWeight).toBe(90)
  })
})

describe('pickMobility', () => {
  it('gives a hips/thoracic warm-up and balance + carry finisher for lower days', () => {
    const { warmup, finisher } = pickMobility('lower', MOBILITY)
    expect(warmup.map((m) => m.focus)).toEqual(['hips', 'hips', 'thoracic'])
    expect(new Set(warmup.map((m) => m.id)).size).toBe(3)
    expect(finisher.map((m) => m.focus).sort()).toEqual(['balance', 'grip-carry'])
  })
  it('rotates away from last session where possible', () => {
    const first = pickMobility('upper', MOBILITY)
    const second = pickMobility('upper', MOBILITY, [...first.warmup, ...first.finisher].map((m) => m.id))
    expect(second.finisher.every((m) => !first.finisher.includes(m))).toBe(true)
  })
})
