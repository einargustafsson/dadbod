import Dexie, { type EntityTable } from 'dexie'
import type { BodyWeight, Run, Session, SetLog, Settings } from '../types'

export const db = new Dexie('dadbod') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  sets: EntityTable<SetLog, 'id'>
  bodyWeights: EntityTable<BodyWeight, 'date'>
  runs: EntityTable<Run, 'id'>
  settings: EntityTable<Settings, 'id'>
}

db.version(1).stores({
  sessions: '++id, date, status',
  sets: '++id, sessionId, exerciseId',
  bodyWeights: 'date',
  runs: '++id, date',
  settings: 'id',
})

export const DEFAULT_SETTINGS: Settings = {
  id: 'main',
  startWeight: 92,
  goalWeight: 85,
  setsPerExercise: 3,
  excludedExerciseIds: [],
  disabledEquipment: [],
  startingWeights: {},
}

export async function getSettings(): Promise<Settings> {
  return (await db.settings.get('main')) ?? DEFAULT_SETTINGS
}
