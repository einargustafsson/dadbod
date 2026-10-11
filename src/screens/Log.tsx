import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '../db/schema'
import { isoDate } from '../engine/dates'
import type { Ride, Run } from '../types'
import { Button, Card, H, fmtKg, inputCls } from '../ui'

function BodyWeightForm() {
  const [date, setDate] = useState(isoDate())
  const [kg, setKg] = useState('')
  const value = Number(kg.replace(',', '.'))
  const valid = value > 30 && value < 300

  async function save() {
    await db.bodyWeights.put({ date, kg: value })
    setKg('')
  }
  return (
    <Card>
      <div className="mb-2 font-semibold">Body weight</div>
      <div className="grid grid-cols-2 gap-2">
        <input className={inputCls} type="date" value={date} max={isoDate()} onChange={(e) => setDate(e.target.value)} />
        <input className={inputCls} inputMode="decimal" placeholder="kg" value={kg} onChange={(e) => setKg(e.target.value)} />
      </div>
      <Button className="mt-3 w-full" disabled={!valid || !date} onClick={save}>Save weight</Button>
    </Card>
  )
}

function RunForm() {
  const [date, setDate] = useState(isoDate())
  const [km, setKm] = useState('')
  const [min, setMin] = useState('')
  const [effort, setEffort] = useState<Run['effort']>(3)
  const distance = Number(km.replace(',', '.'))
  const duration = Number(min)
  const valid = distance > 0 && duration > 0

  async function save() {
    await db.runs.add({ date, distanceKm: distance, durationMin: duration, effort })
    setKm('')
    setMin('')
  }
  return (
    <Card>
      <div className="mb-2 font-semibold">Run</div>
      <div className="grid grid-cols-3 gap-2">
        <input className={inputCls} type="date" value={date} max={isoDate()} onChange={(e) => setDate(e.target.value)} />
        <input className={inputCls} inputMode="decimal" placeholder="km" value={km} onChange={(e) => setKm(e.target.value)} />
        <input className={inputCls} inputMode="numeric" placeholder="min" value={min} onChange={(e) => setMin(e.target.value)} />
      </div>
      <label className="mt-3 block text-sm text-slate-400">
        Effort: {effort}/5 {effort >= 4 ? '(counts as a hard run for leg-day planning)' : ''}
        <input className="mt-1 w-full" type="range" min={1} max={5} value={effort}
          onChange={(e) => setEffort(Number(e.target.value) as Run['effort'])} />
      </label>
      <Button className="mt-3 w-full" disabled={!valid || !date} onClick={save}>Save run</Button>
    </Card>
  )
}

function RideForm() {
  const [date, setDate] = useState(isoDate())
  const [km, setKm] = useState('')
  const [min, setMin] = useState('')
  const [effort, setEffort] = useState<Ride['effort']>(3)
  const distance = Number(km.replace(',', '.'))
  const duration = Number(min)
  const valid = distance > 0 && duration > 0

  async function save() {
    await db.rides.add({ date, distanceKm: distance, durationMin: duration, effort })
    setKm('')
    setMin('')
  }
  return (
    <Card>
      <div className="mb-2 font-semibold">Bike ride</div>
      <div className="grid grid-cols-3 gap-2">
        <input className={inputCls} type="date" value={date} max={isoDate()} onChange={(e) => setDate(e.target.value)} />
        <input className={inputCls} inputMode="decimal" placeholder="km" value={km} onChange={(e) => setKm(e.target.value)} />
        <input className={inputCls} inputMode="numeric" placeholder="min" value={min} onChange={(e) => setMin(e.target.value)} />
      </div>
      <label className="mt-3 block text-sm text-slate-400">
        Effort: {effort}/5 {effort >= 4 ? '(counts as a hard ride for leg-day planning)' : ''}
        <input className="mt-1 w-full" type="range" min={1} max={5} value={effort}
          onChange={(e) => setEffort(Number(e.target.value) as Ride['effort'])} />
      </label>
      <Button className="mt-3 w-full" disabled={!valid || !date} onClick={save}>Save ride</Button>
    </Card>
  )
}

export function Log() {
  const weights = useLiveQuery(() => db.bodyWeights.orderBy('date').reverse().limit(8).toArray(), [])
  const runs = useLiveQuery(() => db.runs.orderBy('date').reverse().limit(8).toArray(), [])
  const rides = useLiveQuery(() => db.rides.orderBy('date').reverse().limit(8).toArray(), [])
  return (
    <div className="space-y-3">
      <BodyWeightForm />
      <RunForm />
      <RideForm />
      <H>Recent weights</H>
      <ul className="space-y-1 text-sm">
        {weights?.map((w) => (
          <li key={w.date} className="flex justify-between">
            <span>{w.date} · {fmtKg(w.kg)} kg</span>
            <button className="text-rose-400" onClick={() => db.bodyWeights.delete(w.date)}>Delete</button>
          </li>
        ))}
        {weights?.length === 0 && <li className="text-slate-400">Nothing logged yet.</li>}
      </ul>
      <H>Recent runs</H>
      <ul className="space-y-1 text-sm">
        {runs?.map((r) => (
          <li key={r.id} className="flex justify-between">
            <span>{r.date} · {fmtKg(r.distanceKm)} km · {r.durationMin} min · effort {r.effort}</span>
            <button className="text-rose-400" onClick={() => db.runs.delete(r.id!)}>Delete</button>
          </li>
        ))}
        {runs?.length === 0 && <li className="text-slate-400">Nothing logged yet.</li>}
      </ul>
      <H>Recent rides</H>
      <ul className="space-y-1 text-sm">
        {rides?.map((r) => (
          <li key={r.id} className="flex justify-between gap-3">
            <span>
              {r.date} · {fmtKg(r.distanceKm)} km · {r.durationMin} min · {fmtKg(Math.round((r.distanceKm / (r.durationMin / 60)) * 10) / 10)} km/h · effort {r.effort}
            </span>
            <button className="shrink-0 text-rose-400" onClick={() => db.rides.delete(r.id!)}>Delete</button>
          </li>
        ))}
        {rides?.length === 0 && <li className="text-slate-400">Nothing logged yet.</li>}
      </ul>
    </div>
  )
}
