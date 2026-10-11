import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db, getSettings } from '../db/schema'
import { EXERCISE_BY_ID, MOBILITY } from '../db/seed/exercises'
import { HOWTO, demoUrl } from '../db/seed/howto'
import { MEDIA_IDS } from '../db/seed/media'
import { ExerciseAnimation } from './ExerciseAnimation'
import { discardSession, finishSession, swapExercise } from '../services/plan'
import { useApp } from '../store'
import type { Exercise, SetLog } from '../types'
import { Button, Card, H, fmtKg, inputCls } from '../ui'

function RestTimer() {
  const { restEndsAt, clearRest } = useApp()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!restEndsAt) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [restEndsAt])
  const left = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0
  useEffect(() => {
    if (restEndsAt && left === 0) navigator.vibrate?.([200, 100, 200])
  }, [restEndsAt, left])
  if (!restEndsAt) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between bg-slate-950 px-4 py-3 ring-1 ring-slate-700">
      <span className={left === 0 ? 'font-semibold text-emerald-400' : 'text-lg tabular-nums'}>
        {left === 0 ? 'Rest over' : `Rest ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}
      </span>
      <Button variant="ghost" onClick={clearRest}>Dismiss</Button>
    </div>
  )
}

function SetRow({ set, defaultWeight, restSeconds }: { set: SetLog; defaultWeight: number; restSeconds: number }) {
  const startRest = useApp((s) => s.startRest)
  const [w, setW] = useState<string>()
  const [r, setR] = useState<string>()
  const [rpe, setRpe] = useState<string>('')
  const done = set.actualReps !== undefined

  async function toggle() {
    if (done) {
      await db.sets.update(set.id!, { actualReps: undefined, actualWeight: undefined, rpe: undefined })
      return
    }
    await db.sets.update(set.id!, {
      actualReps: Number(r ?? set.targetReps),
      actualWeight: Number(w ?? defaultWeight),
      rpe: rpe ? Number(rpe) : undefined,
    })
    startRest(restSeconds)
  }

  return (
    <div className={`grid grid-cols-[1rem_1fr_1fr_4.75rem_2.5rem] items-center gap-2 ${done ? 'opacity-60' : ''}`}>
      <span className="text-sm text-slate-400">{set.setNumber}</span>
      <input className={inputCls} inputMode="decimal" aria-label="Weight (kg)" disabled={done}
        value={done ? fmtKg(set.actualWeight!) : (w ?? (defaultWeight ? fmtKg(defaultWeight) : ''))}
        placeholder="kg" onChange={(e) => setW(e.target.value)} />
      <input className={inputCls} inputMode="numeric" aria-label="Reps" disabled={done}
        value={done ? String(set.actualReps) : (r ?? String(set.targetReps))}
        onChange={(e) => setR(e.target.value)} />
      <select className={inputCls} aria-label="RPE" disabled={done} value={done ? String(set.rpe ?? '') : rpe}
        onChange={(e) => setRpe(e.target.value)}>
        <option value="">RPE</option>
        {[6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <button aria-label={done ? 'Undo set' : 'Complete set'} onClick={toggle}
        className={`h-10 rounded-lg ${done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700'}`}>✓</button>
    </div>
  )
}

function ExerciseInfo({ ex }: { ex: Exercise }) {
  const settings = useLiveQuery(getSettings, [])
  const howTo = HOWTO[ex.id]
  const custom = settings?.videoUrls?.[ex.id]

  async function saveLink(value: string) {
    if (!settings) return
    const v = value.trim()
    const next = { ...settings.videoUrls }
    if (/^https?:\/\//i.test(v)) next[ex.id] = v
    else delete next[ex.id]
    await db.settings.put({ ...settings, videoUrls: next })
  }

  return (
    <div className="mb-3 rounded-lg bg-slate-900 p-3 text-sm">
      {MEDIA_IDS.has(ex.id) && <ExerciseAnimation id={ex.id} name={ex.name} />}
      {howTo && (
        <>
          <ol className="list-decimal space-y-1 pl-5 text-slate-200">
            {howTo.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
          <p className="mt-2 text-amber-300">Watch for: {howTo.cue}</p>
        </>
      )}
      <a className="mt-3 inline-block text-sky-400 underline" href={demoUrl(ex, custom)} target="_blank" rel="noopener noreferrer">
        {custom ? 'Watch your saved video' : 'Watch demo videos'}
      </a>
      <input key={custom ?? ''} className={`${inputCls} mt-2 text-sm`} placeholder="Paste your own video link (optional)"
        defaultValue={custom ?? ''} onBlur={(e) => void saveLink(e.target.value)} />
    </div>
  )
}

function Checklist({ title, ids }: { title: string; ids: string[] }) {
  const [checked, setChecked] = useState<string[]>([])
  const moves = ids.map((id) => MOBILITY.find((m) => m.id === id)!).filter(Boolean)
  return (
    <Card>
      <H>{title}</H>
      <ul className="space-y-2">
        {moves.map((m) => (
          <li key={m.id}>
            <label className="flex gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={checked.includes(m.id)}
                onChange={() => setChecked((c) => (c.includes(m.id) ? c.filter((x) => x !== m.id) : [...c, m.id]))} />
              <span>
                <span className="block">{m.name}</span>
                <span className="block text-sm text-slate-400">{m.cue}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function Session({ id }: { id: number }) {
  const [infoFor, setInfoFor] = useState<string | null>(null)
  const close = () => useApp.getState().openSession(null)
  const session = useLiveQuery(() => db.sessions.get(id), [id])
  const sets = useLiveQuery(() => db.sets.where('sessionId').equals(id).sortBy('setNumber'), [id])
  const [notice, setNotice] = useState('')
  if (!session || !sets) return null

  if (session.status === 'done') {
    const logged = sets.filter((s) => s.actualReps !== undefined)
    const volume = logged.reduce((v, s) => v + s.actualReps! * s.actualWeight!, 0)
    return (
      <div className="space-y-3 p-4">
        <Card>
          <div className="text-xl font-semibold">Workout saved</div>
          <p className="mt-1 text-slate-400">{logged.length} sets · {Math.round(volume).toLocaleString()} kg total volume</p>
          <p className="mt-2 text-sm text-slate-400">Next time's weights and reps are adjusted automatically.</p>
          <Button className="mt-4 w-full" onClick={close}>Done</Button>
        </Card>
      </div>
    )
  }

  const unfinished = sets.some((s) => s.actualReps === undefined)

  async function finish() {
    if (unfinished && !confirm('Some sets are not logged. Finish anyway? Unlogged sets are ignored.')) return
    await finishSession(id)
  }
  async function discard() {
    if (!confirm('Discard this workout?')) return
    await discardSession(id)
    close()
  }

  return (
    <div className="space-y-3 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold capitalize">{session.type} body{session.deload ? ' · deload' : ''}</h1>
        <button className="text-sm text-slate-400" onClick={close}>Minimize</button>
      </div>
      {notice && <p className="text-sm text-amber-300">{notice}</p>}

      <Checklist title="Warm-up" ids={session.warmupIds} />

      {session.exerciseIds.map((exId) => {
        const ex = EXERCISE_BY_ID[exId]
        const rows = sets.filter((s) => s.exerciseId === exId)
        return (
          <Card key={exId}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{ex.name}</div>
                <div className="text-xs text-slate-400">
                  {rows.length}×{rows[0]?.targetReps} · {ex.equipment}
                  {rows[0]?.targetWeight ? ` · target ${fmtKg(rows[0].targetWeight)} kg` : ''}
                </div>
              </div>
              <div className="flex shrink-0 gap-4">
              <button className="text-sm text-slate-300" aria-expanded={infoFor === exId}
                onClick={() => setInfoFor(infoFor === exId ? null : exId)}>
                How to
              </button>
              <button className="text-sm text-sky-400" onClick={async () =>
                setNotice((await swapExercise(id, exId)) ? '' : `No alternative available for ${ex.name}.`)}>
                Swap
              </button>
              </div>
            </div>
            {infoFor === exId && <ExerciseInfo ex={ex} />}
            <div className="space-y-2">
              {rows.map((s, i) => (
                <SetRow key={s.id} set={s}
                  defaultWeight={i > 0 && rows[i - 1].actualWeight !== undefined ? rows[i - 1].actualWeight! : s.targetWeight}
                  restSeconds={ex.isCompound ? 120 : 75} />
              ))}
            </div>
          </Card>
        )
      })}

      <Checklist title="Finisher" ids={session.finisherIds} />

      <div className="flex gap-2">
        <Button variant="danger" onClick={discard}>Discard</Button>
        <Button className="flex-1" onClick={finish}>Finish workout</Button>
      </div>
      <RestTimer />
    </div>
  )
}
