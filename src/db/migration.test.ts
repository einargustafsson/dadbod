import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'

describe('database upgrade v1 -> v2 (adds rides)', () => {
  it('keeps existing data and exposes an empty rides table', async () => {
    // Exactly the schema shipped before the ride log existed.
    const old = new Dexie('dadbod')
    old.version(1).stores({
      sessions: '++id, date, status',
      sets: '++id, sessionId, exerciseId',
      bodyWeights: 'date',
      runs: '++id, date',
      settings: 'id',
    })
    await old.table('bodyWeights').put({ date: '2026-10-01', kg: 92 })
    await old.table('runs').add({ date: '2026-10-02', distanceKm: 10, durationMin: 60, effort: 3 })
    const sessionId = await old.table('sessions').add({
      date: '2026-10-03', type: 'upper', status: 'done', deload: false, exerciseIds: ['bench'], warmupIds: [], finisherIds: [],
    })
    await old.table('sets').add({ sessionId, exerciseId: 'bench', setNumber: 1, targetReps: 5, targetWeight: 60, actualReps: 5, actualWeight: 60 })
    old.close()

    const { db } = await import('./schema')
    expect(await db.bodyWeights.toArray()).toEqual([{ date: '2026-10-01', kg: 92 }])
    expect(await db.runs.count()).toBe(1)
    expect(await db.sessions.count()).toBe(1)
    expect(await db.sets.count()).toBe(1)
    expect(await db.rides.count()).toBe(0)

    await db.rides.add({ date: '2026-10-04', distanceKm: 40, durationMin: 100, effort: 2 })
    expect(await db.rides.count()).toBe(1)
  })
})
