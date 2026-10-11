import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useState } from 'react'
import { db, getSettings } from '../db/schema'
import { buildPlan, startSession, type Plan } from '../services/plan'
import { useApp } from '../store'
import { Button, Card, H, fmtKg } from '../ui'

export function Today() {
  const [plan, setPlan] = useState<Plan | null>(null)
  const openSession = useApp((s) => s.openSession)
  const inProgress = useLiveQuery(() => db.sessions.where('status').equals('in-progress').first(), [])
  const latestWeight = useLiveQuery(() => db.bodyWeights.orderBy('date').last(), [])
  const settings = useLiveQuery(getSettings, [])

  const load = useCallback(() => void buildPlan().then(setPlan), [])
  useEffect(load, [load])

  async function start() {
    if (!plan) return
    openSession(await startSession(plan))
  }

  return (
    <div className="space-y-3">
      {settings && (
        <Card className="flex items-baseline justify-between">
          <div>
            <div className="text-xs text-slate-400">Body weight</div>
            <div className="text-2xl font-semibold">{latestWeight ? `${fmtKg(latestWeight.kg)} kg` : '—'}</div>
          </div>
          <div className="text-right text-sm text-slate-400">
            Goal {fmtKg(settings.goalWeight)} kg
            {latestWeight && <div>{fmtKg(Math.max(0, latestWeight.kg - settings.goalWeight))} kg to go</div>}
          </div>
        </Card>
      )}

      {inProgress && (
        <Card className="border border-sky-500">
          <div className="font-semibold">Workout in progress</div>
          <Button className="mt-3 w-full" onClick={() => openSession(inProgress.id!)}>Resume</Button>
        </Card>
      )}

      {plan && !inProgress && (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-semibold capitalize">{plan.type} body</div>
              <div className="text-sm text-slate-400">{plan.reason} · ~{plan.estimatedMinutes} min</div>
            </div>
            {plan.deload && <span className="rounded bg-amber-500/20 px-2 py-1 text-xs text-amber-300">Deload</span>}
          </div>
          {plan.deload && <p className="mt-2 text-sm text-amber-300">{plan.deloadReason}: fewer sets, lighter weights.</p>}
          {plan.reducedVolume && <p className="mt-2 text-sm text-amber-300">Volume trimmed after your hard run.</p>}

          <H>Warm-up</H>
          <ul className="text-sm text-slate-300">{plan.warmup.map((m) => <li key={m.id}>{m.name}</li>)}</ul>

          <H>Lifts</H>
          <ul className="space-y-1 text-sm">
            {plan.exercises.map((p) => (
              <li key={p.exercise.id} className="flex justify-between gap-3">
                <span>{p.exercise.name}</span>
                <span className="shrink-0 text-slate-400">
                  {p.sets}×{p.targetReps}
                  {p.targetWeight > 0 ? ` @ ${fmtKg(p.targetWeight)} kg` : p.exercise.equipment === 'bodyweight' ? '' : ' · set weight'}
                </span>
              </li>
            ))}
          </ul>

          <H>Finisher</H>
          <ul className="text-sm text-slate-300">{plan.finisher.map((m) => <li key={m.id}>{m.name}</li>)}</ul>

          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={load}>Reshuffle</Button>
            <Button className="flex-1" onClick={start}>Start workout</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
