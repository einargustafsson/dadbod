import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/schema'
import { exportData, importData } from './backup'

beforeEach(async () => {
  await Promise.all([db.sessions.clear(), db.sets.clear(), db.bodyWeights.clear(), db.runs.clear(), db.settings.clear()])
})

describe('backup', () => {
  it('round-trips data and keeps the API key out of the export', async () => {
    await db.settings.put({
      id: 'main', startWeight: 92, goalWeight: 85, setsPerExercise: 3, excludedExerciseIds: [],
      disabledEquipment: [], startingWeights: { bench: 60 }, claudeKey: 'sk-secret',
    })
    await db.bodyWeights.put({ date: '2026-10-01', kg: 92 })
    await db.runs.add({ date: '2026-10-02', distanceKm: 10, durationMin: 60, effort: 3 })
    const sid = (await db.sessions.add({
      date: '2026-10-03', type: 'upper', status: 'done', deload: false, exerciseIds: ['bench'], warmupIds: [], finisherIds: [],
    })) as number
    await db.sets.add({ sessionId: sid, exerciseId: 'bench', setNumber: 1, targetReps: 5, targetWeight: 60, actualReps: 5, actualWeight: 60 })

    const backup = await exportData()
    const text = JSON.stringify(backup)
    expect(text).not.toContain('sk-secret')

    await Promise.all([db.sessions.clear(), db.sets.clear(), db.bodyWeights.clear(), db.runs.clear()])
    await importData(text)
    expect(await db.sessions.count()).toBe(1)
    expect(await db.sets.count()).toBe(1)
    expect(await db.bodyWeights.count()).toBe(1)
    expect(await db.runs.count()).toBe(1)
    const settings = await db.settings.get('main')
    expect(settings?.startingWeights).toEqual({ bench: 60 })
    expect(settings?.claudeKey).toBe('sk-secret') // existing key preserved
  })

  it('rejects bad files without touching existing data', async () => {
    await db.bodyWeights.put({ date: '2026-10-01', kg: 92 })
    await expect(importData('not json')).rejects.toThrow('valid JSON')
    await expect(importData('{"app":"other"}')).rejects.toThrow('not a Dadbod backup')
    expect(await db.bodyWeights.count()).toBe(1)
  })
})
