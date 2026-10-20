import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState } from 'react'
import { DEFAULT_SETTINGS, db, getSettings } from '../db/schema'
import { EXERCISES } from '../db/seed/exercises'
import { exportData, importData } from '../services/backup'
import type { Equipment, Settings as S } from '../types'
import { Button, Card, H, fmtKg, inputCls, parseNum } from '../ui'

const EQUIPMENT: Equipment[] = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight']

export function Settings() {
  const settings = useLiveQuery(getSettings, [])
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  if (!settings) return null

  const save = (patch: Partial<S>) => db.settings.put({ ...settings, ...patch })
  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

  async function doExport() {
    const blob = new Blob([JSON.stringify(await exportData(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `dadbod-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setMsg('Backup downloaded.')
  }

  async function doImport(file: File) {
    if (!confirm('Importing replaces all current data. Continue?')) return
    try {
      await importData(await file.text())
      setMsg('Backup restored.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Import failed.')
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-xs text-slate-400">Start (kg)
            <input className={inputCls} inputMode="decimal" defaultValue={settings.startWeight}
              onBlur={(e) => parseNum(e.target.value) > 0 && save({ startWeight: parseNum(e.target.value) })} />
          </label>
          <label className="text-xs text-slate-400">Goal (kg)
            <input className={inputCls} inputMode="decimal" defaultValue={settings.goalWeight}
              onBlur={(e) => parseNum(e.target.value) > 0 && save({ goalWeight: parseNum(e.target.value) })} />
          </label>
          <label className="text-xs text-slate-400">Sets/lift
            <select className={inputCls} value={settings.setsPerExercise}
              onChange={(e) => save({ setsPerExercise: Number(e.target.value) })}>
              {[2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="mb-2 font-semibold">Available equipment</div>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((eq) => {
            const off = settings.disabledEquipment.includes(eq)
            return (
              <button key={eq} onClick={() => save({ disabledEquipment: toggle(settings.disabledEquipment, eq) })}
                className={`rounded-full px-3 py-1 text-sm capitalize ${off ? 'bg-slate-700 text-slate-400 line-through' : 'bg-sky-500 text-slate-950'}`}>
                {eq}
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <details>
          <summary className="cursor-pointer font-semibold">Starting weights and exclusions</summary>
          <p className="mt-2 text-sm text-slate-400">
            Enter a starting weight (kg) for lifts you do, so the first workout has a target. Untick lifts you never want.
          </p>
          <ul className="mt-3 space-y-2">
            {EXERCISES.map((ex) => (
              <li key={ex.id} className="grid grid-cols-[1.5rem_1fr_5rem] items-center gap-2 text-sm">
                <input type="checkbox" className="h-5 w-5" checked={!settings.excludedExerciseIds.includes(ex.id)}
                  aria-label={`Include ${ex.name}`}
                  onChange={() => save({ excludedExerciseIds: toggle(settings.excludedExerciseIds, ex.id) })} />
                <span>{ex.name}</span>
                {ex.equipment === 'bodyweight' ? <span /> : (
                  <input className={inputCls} inputMode="decimal" placeholder="kg"
                    defaultValue={settings.startingWeights[ex.id] ? fmtKg(settings.startingWeights[ex.id]) : ''}
                    onBlur={(e) => {
                      const v = parseNum(e.target.value)
                      const next = { ...settings.startingWeights }
                      if (v > 0) next[ex.id] = v
                      else delete next[ex.id]
                      void save({ startingWeights: next })
                    }} />
                )}
              </li>
            ))}
          </ul>
        </details>
      </Card>

      <Card>
        <div className="mb-1 font-semibold">Claude API key (optional)</div>
        <p className="text-sm text-slate-400">
          Enables the weekly review. Stored only in this browser and never included in backups. The app works fully without it.
        </p>
        <input className={`${inputCls} mt-3`} type="password" autoComplete="off" placeholder="sk-ant-…"
          defaultValue={settings.claudeKey ?? ''}
          onBlur={(e) => { const v = e.target.value.trim(); void save({ claudeKey: v || undefined }) }} />
      </Card>

      <Card>
        <div className="mb-1 font-semibold">Backup</div>
        <p className="text-sm text-slate-400">All data lives only on this device. Export regularly.</p>
        <div className="mt-3 flex gap-2">
          <Button variant="ghost" onClick={doExport}>Export JSON</Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>Import JSON</Button>
          <input ref={fileRef} type="file" accept="application/json" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = '' }} />
        </div>
        {msg && <p className="mt-2 text-sm text-slate-300">{msg}</p>}
      </Card>
      <Card>
        <div className="mb-1 font-semibold">Credits</div>
        <p className="text-sm text-slate-400">
          Exercise images from the{' '}
          <a className="text-sky-400 underline" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">
            Free Exercise DB
          </a>{' '}
          (Unlicense, derived from exercises.json by Ollie Jennings). Where an exact match was not available, the app shows
          text instructions only.
        </p>
      </Card>
      <H>Defaults: {DEFAULT_SETTINGS.startWeight} → {DEFAULT_SETTINGS.goalWeight} kg</H>
    </div>
  )
}
