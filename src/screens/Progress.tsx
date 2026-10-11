import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db, getSettings } from '../db/schema'
import { EXERCISE_BY_ID } from '../db/seed/exercises'
import { weekStart } from '../engine/dates'
import { e1rm } from '../engine/progress'
import { assessRate, movingAverage, weeklyRate, weeksToGoal, type RateStatus } from '../engine/trend'
import { Card, H, fmtKg, inputCls } from '../ui'
import { Coach } from './Coach'

const STATUS_TEXT: Record<RateStatus, string> = {
  'on-track': 'On track',
  slow: 'Slower than target. Small, steady cuts work; check food log before changing training.',
  'too-fast': 'Losing faster than ~1% of body weight per week. Eat a bit more to protect muscle.',
  'insufficient-data': 'Log weight for a week or more to see a trend.',
}

const axis = { stroke: '#94a3b8', fontSize: 11 }
const tip = { contentStyle: { background: '#0f172a', border: '1px solid #334155' } }

export function Progress() {
  const weights = useLiveQuery(() => db.bodyWeights.toArray(), [])
  const settings = useLiveQuery(getSettings, [])
  const lifts = useLiveQuery(async () => {
    const done = await db.sessions.where('status').equals('done').toArray()
    const dates = new Map(done.map((s) => [s.id!, s.date]))
    const sets = (await db.sets.where('sessionId').anyOf([...dates.keys()]).toArray()).filter((s) => s.actualReps !== undefined)
    return { dates, sets }
  }, [])
  const runs = useLiveQuery(() => db.runs.toArray(), [])
  const rides = useLiveQuery(() => db.rides.toArray(), [])
  const [exId, setExId] = useState('')

  if (!weights || !settings || !lifts || !runs || !rides) return null

  const trend = movingAverage(weights)
  const latest = trend[trend.length - 1]
  const rate = weeklyRate(trend)
  const status = latest ? assessRate(rate, latest.kg) : 'insufficient-data'
  const weeks = latest ? weeksToGoal(latest.trend, settings.goalWeight, rate) : null

  const exIds = [...new Set(lifts.sets.map((s) => s.exerciseId))].sort((a, b) =>
    EXERCISE_BY_ID[a].name.localeCompare(EXERCISE_BY_ID[b].name))
  const selected = exId || exIds[0]
  const strength = selected
    ? [...lifts.sets.filter((s) => s.exerciseId === selected).reduce((m, s) => {
        const d = lifts.dates.get(s.sessionId)!
        m.set(d, Math.max(m.get(d) ?? 0, e1rm(s.actualWeight!, s.actualReps!)))
        return m
      }, new Map<string, number>())]
        .map(([date, est]) => ({ date, e1rm: Math.round(est * 10) / 10 }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : []

  const volume = new Map<string, number>()
  for (const s of lifts.sets) {
    const wk = weekStart(lifts.dates.get(s.sessionId)!)
    volume.set(wk, (volume.get(wk) ?? 0) + s.actualReps! * s.actualWeight!)
  }
  const volumeData = [...volume].sort().slice(-8).map(([week, kg]) => ({ week: week.slice(5), kg: Math.round(kg) }))

  const km = new Map<string, number>()
  for (const r of runs) km.set(weekStart(r.date), (km.get(weekStart(r.date)) ?? 0) + r.distanceKm)
  const runData = [...km].sort().slice(-8).map(([week, k]) => ({ week: week.slice(5), km: Math.round(k * 10) / 10 }))

  const rideKm = new Map<string, number>()
  for (const r of rides) rideKm.set(weekStart(r.date), (rideKm.get(weekStart(r.date)) ?? 0) + r.distanceKm)
  const rideData = [...rideKm].sort().slice(-8).map(([week, k]) => ({ week: week.slice(5), km: Math.round(k * 10) / 10 }))

  return (
    <div className="space-y-3">
      <Coach />
      <Card>
        <div className="font-semibold">Body weight</div>
        {latest ? (
          <>
            <div className="mt-1 text-sm text-slate-300">
              Trend {fmtKg(Math.round(latest.trend * 10) / 10)} kg
              {rate !== null && ` · ${rate > 0 ? '+' : ''}${rate.toFixed(2)} kg/week`}
              {weeks !== null && weeks > 0 && ` · ~${Math.ceil(weeks)} weeks to ${fmtKg(settings.goalWeight)} kg`}
            </div>
            <div className={`mt-1 text-sm ${status === 'too-fast' ? 'text-amber-300' : 'text-slate-400'}`}>{STATUS_TEXT[status]}</div>
            <div className="mt-3 h-52">
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} {...axis} />
                  <YAxis domain={[(min: number) => Math.floor(Math.min(min, settings.goalWeight) - 1), (max: number) => Math.ceil(max + 1)]} {...axis} width={32} />
                  <Tooltip {...tip} />
                  <ReferenceLine y={settings.goalWeight} stroke="#34d399" strokeDasharray="4 4" />
                  <Line dataKey="kg" stroke="#64748b" dot={{ r: 2 }} strokeWidth={1} name="Weight" />
                  <Line dataKey="trend" stroke="#38bdf8" dot={false} strokeWidth={2} name="Trend" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : <p className="mt-1 text-sm text-slate-400">{STATUS_TEXT['insufficient-data']}</p>}
      </Card>

      <Card>
        <div className="mb-2 font-semibold">Strength (estimated 1RM)</div>
        {exIds.length === 0 ? <p className="text-sm text-slate-400">Finish a workout to see strength trends.</p> : (
          <>
            <select className={inputCls} value={selected} onChange={(e) => setExId(e.target.value)}>
              {exIds.map((id) => <option key={id} value={id}>{EXERCISE_BY_ID[id].name}</option>)}
            </select>
            <div className="mt-3 h-44">
              <ResponsiveContainer>
                <LineChart data={strength}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} {...axis} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} {...axis} width={32} />
                  <Tooltip {...tip} />
                  <Line dataKey="e1rm" stroke="#38bdf8" strokeWidth={2} name="e1RM kg" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Card>

      <Card>
        <div className="mb-2 font-semibold">Weekly lifting volume (kg)</div>
        <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={volumeData}>
              <XAxis dataKey="week" {...axis} /><YAxis {...axis} width={40} /><Tooltip {...tip} />
              <Bar dataKey="kg" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="mb-2 font-semibold">Weekly running (km)</div>
        <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={runData}>
              <XAxis dataKey="week" {...axis} /><YAxis {...axis} width={32} /><Tooltip {...tip} />
              <Bar dataKey="km" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <div className="mb-2 font-semibold">Weekly cycling (km)</div>
        <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={rideData}>
              <XAxis dataKey="week" {...axis} /><YAxis {...axis} width={32} /><Tooltip {...tip} />
              <Bar dataKey="km" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <H>Charts use week-start dates (Mondays)</H>
    </div>
  )
}
