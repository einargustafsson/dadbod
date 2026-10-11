import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, db } from '../db/schema'
import { buildPlan, finishSession, loadAllPerformance, startSession, swapExercise, targetFor } from './plan'

beforeEach(async () => {
  await Promise.all([db.sessions.clear(), db.sets.clear(), db.runs.clear(), db.settings.clear()])
})

async function completeAtTop(sessionId: number, reps: (target: number) => number) {
  const sets = await db.sets.where('sessionId').equals(sessionId).toArray()
  for (const s of sets) {
    await db.sets.update(s.id!, { actualReps: reps(s.targetReps), actualWeight: s.targetWeight || 40, rpe: 7 })
  }
  await finishSession(sessionId)
}

describe('plan service', () => {
  it('alternates upper and lower between completed sessions', async () => {
    const first = await buildPlan()
    expect(first.type).toBe('upper')
    await completeAtTop(await startSession(first), (t) => t + 1)
    const second = await buildPlan()
    expect(second.type).toBe('lower')
    await completeAtTop(await startSession(second), (t) => t + 1)
    expect((await buildPlan()).type).toBe('upper')
  })

  it('adds a rep next time after hitting the rep target', async () => {
    const plan = await buildPlan()
    const id = await startSession(plan)
    await completeAtTop(id, (t) => t) // hit exactly the target reps, below the top of the range
    const ex = plan.exercises[0]
    const target = targetFor(ex.exercise, await loadAllPerformance(), DEFAULT_SETTINGS)
    expect(target.reps).toBe(ex.targetReps + 1)
  })

  it('uses the first weight entered as the baseline when the target was 0', async () => {
    const plan = await buildPlan()
    const ex = plan.exercises[0]
    expect(ex.targetWeight).toBe(0)
    const id = await startSession(plan)
    await completeAtTop(id, () => ex.exercise.repMax) // completeAtTop logs 40 kg for 0 kg targets
    const target = targetFor(ex.exercise, await loadAllPerformance(), DEFAULT_SETTINGS)
    expect(target.weight).toBe(40 + ex.exercise.increment)
    expect(target.reps).toBe(ex.exercise.repMin)
  })

  it('swaps an exercise for one of the same pattern', async () => {
    const plan = await buildPlan()
    const id = await startSession(plan)
    const old = plan.exercises[0].exercise
    expect(await swapExercise(id, old.id)).toBe(true)
    const s = await db.sessions.get(id)
    expect(s!.exerciseIds).not.toContain(old.id)
    const sets = await db.sets.where('sessionId').equals(id).toArray()
    expect(sets.filter((x) => x.exerciseId === old.id)).toHaveLength(0)
    expect(sets).toHaveLength(plan.exercises.length * 3)
  })
})
