import { db } from '../db/schema'
import type { BodyWeight, Run, Session, SetLog, Settings } from '../types'

export interface Backup {
  app: 'dadbod'
  version: 1
  exportedAt: string
  sessions: Session[]
  sets: SetLog[]
  bodyWeights: BodyWeight[]
  runs: Run[]
  settings: Omit<Settings, 'claudeKey'> | null
}

/** The Claude API key is deliberately left out so backups are safe to store or share. */
export async function exportData(): Promise<Backup> {
  const settings = await db.settings.get('main')
  if (settings) delete settings.claudeKey
  return {
    app: 'dadbod', version: 1, exportedAt: new Date().toISOString(),
    sessions: await db.sessions.toArray(),
    sets: await db.sets.toArray(),
    bodyWeights: await db.bodyWeights.toArray(),
    runs: await db.runs.toArray(),
    settings: settings ?? null,
  }
}

function isBackup(x: unknown): x is Backup {
  const b = x as Backup
  return (
    !!b && b.app === 'dadbod' && b.version === 1 &&
    Array.isArray(b.sessions) && Array.isArray(b.sets) && Array.isArray(b.bodyWeights) && Array.isArray(b.runs)
  )
}

/** Replaces all data. Validates the file first so a bad import cannot wipe existing data. */
export async function importData(json: string): Promise<void> {
  let parsed: unknown
  try { parsed = JSON.parse(json) } catch { throw new Error('File is not valid JSON.') }
  if (!isBackup(parsed)) throw new Error('File is not a Dadbod backup.')

  await db.transaction('rw', [db.sessions, db.sets, db.bodyWeights, db.runs, db.settings], async () => {
    const existing = await db.settings.get('main')
    await Promise.all([db.sessions.clear(), db.sets.clear(), db.bodyWeights.clear(), db.runs.clear(), db.settings.clear()])
    await db.sessions.bulkPut(parsed.sessions)
    await db.sets.bulkPut(parsed.sets)
    await db.bodyWeights.bulkPut(parsed.bodyWeights)
    await db.runs.bulkPut(parsed.runs)
    if (parsed.settings) await db.settings.put({ ...parsed.settings, claudeKey: existing?.claudeKey })
  })
}
