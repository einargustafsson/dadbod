import { db, getSettings } from '../db/schema'
import { EXERCISE_BY_ID, EXERCISES, MOBILITY } from '../db/seed/exercises'
import { isoDate, roundTo } from '../engine/dates'
import { DELOAD_WEIGHT_FACTOR, deloadDecision } from '../engine/deload'
import { generateWorkout, estimateMinutes, type PlannedExercise } from '../engine/generate'
import { pickMobility } from '../engine/mobility'
import { effectiveTargetWeight, isStalled, nextTarget, type ExercisePerformance } from '../engine/progress'
import { nextSession } from '../engine/schedule'
import type { Exercise, MobilityMove, Session, SessionType, SetLog, Settings } from '../types'

export interface Plan {
  type: SessionType
  reason: string
  deload: boolean
  deloadReason: string
  reducedVolume: boolean
  exercises: PlannedExercise[]
  warmup: MobilityMove[]
  finisher: MobilityMove[]
  estimatedMinutes: number
}

const byRecent = (a: Session, b: Session) => b.date.localeCompare(a.date) || (b.id ?? 0) - (a.id ?? 0)

/** Completed-session history per exercise, most recent first. */
export async function loadAllPerformance(): Promise<Record<string, ExercisePerformance[]>> {
  const done = (await db.sessions.where('status').equals('done').toArray()).sort(byRecent)
  const order = new Map(done.map((s, i) => [s.id!, i]))
  const sets = await db.sets.where('sessionId').anyOf(done.map((s) => s.id!)).toArray()

  const grouped = new Map<string, Map<number, SetLog[]>>()
  for (const s of sets) {
    if (s.actualReps === undefined || s.actualWeight === undefined) continue
    const perEx = grouped.get(s.exerciseId) ?? new Map<number, SetLog[]>()
    perEx.set(s.sessionId, [...(perEx.get(s.sessionId) ?? []), s])
    grouped.set(s.exerciseId, perEx)
  }

  const out: Record<string, ExercisePerformance[]> = {}
  for (const [exId, perSession] of grouped) {
    out[exId] = [...perSession.entries()]
      .sort(([a], [b]) => order.get(a)! - order.get(b)!)
      .map(([, rows]) => ({
        targetReps: rows[0].targetReps,
        targetWeight: effectiveTargetWeight(rows[0].targetWeight, rows.map((r) => r.actualWeight!)),
        sets: rows.map((r) => ({ actualReps: r.actualReps!, actualWeight: r.actualWeight!, rpe: r.rpe })),
      }))
  }
  return out
}

export function targetFor(ex: Exercise, perf: Record<string, ExercisePerformance[]>, settings: Settings) {
  const start = settings.startingWeights[ex.id] ?? ex.startingWeight
  const t = nextTarget(ex, perf[ex.id] ?? [], start)
  return { weight: t.weight, reps: t.reps }
}

export async function buildPlan(rand?: () => number): Promise<Plan> {
  const [settings, sessions, runs, perf] = await Promise.all([
    getSettings(), db.sessions.toArray(), db.runs.toArray(), loadAllPerformance(),
  ])
  const today = isoDate()
  const next = nextSession(sessions, runs, today)

  const cutoff = isoDate(new Date(Date.now() - 14 * 86_400_000))
  const recentIds = new Set(
    sessions.filter((s) => s.status === 'done' && s.date >= cutoff).flatMap((s) => s.exerciseIds),
  )
  const stalledCount = [...recentIds].filter((id) => isStalled(perf[id] ?? [])).length
  const deload = deloadDecision(sessions, stalledCount)

  const lastOfType = sessions.filter((s) => s.status === 'done' && s.type === next.type).sort(byRecent)[0]
  const exercises = generateWorkout({
    type: next.type,
    library: EXERCISES,
    excludedIds: settings.excludedExerciseIds,
    disabledEquipment: settings.disabledEquipment,
    lastSessionIds: lastOfType?.exerciseIds ?? [],
    setsPerExercise: settings.setsPerExercise,
    deload: deload.deload,
    reducedVolume: next.reducedVolume,
    getTarget: (ex) => targetFor(ex, perf, settings),
    rand,
  })
  const mobility = pickMobility(
    next.type, MOBILITY, lastOfType ? [...lastOfType.warmupIds, ...lastOfType.finisherIds] : [], rand,
  )

  return {
    type: next.type,
    reason: next.reason,
    deload: deload.deload,
    deloadReason: deload.reason,
    reducedVolume: next.reducedVolume,
    exercises,
    warmup: mobility.warmup,
    finisher: mobility.finisher,
    estimatedMinutes: estimateMinutes(exercises),
  }
}

function setRows(sessionId: number, p: PlannedExercise): SetLog[] {
  return Array.from({ length: p.sets }, (_, i) => ({
    sessionId, exerciseId: p.exercise.id, setNumber: i + 1,
    targetReps: p.targetReps, targetWeight: p.targetWeight,
  }))
}

export async function startSession(plan: Plan): Promise<number> {
  return db.transaction('rw', db.sessions, db.sets, async () => {
    const id = (await db.sessions.add({
      date: isoDate(), type: plan.type, status: 'in-progress', deload: plan.deload,
      exerciseIds: plan.exercises.map((p) => p.exercise.id),
      warmupIds: plan.warmup.map((m) => m.id),
      finisherIds: plan.finisher.map((m) => m.id),
    })) as number
    await db.sets.bulkAdd(plan.exercises.flatMap((p) => setRows(id, p)))
    return id
  })
}

/** Replace an exercise mid-session with another of the same pattern. Returns false if none is available. */
export async function swapExercise(sessionId: number, oldId: string): Promise<boolean> {
  const [session, settings, perf] = await Promise.all([
    db.sessions.get(sessionId), getSettings(), loadAllPerformance(),
  ])
  const old = EXERCISE_BY_ID[oldId]
  if (!session || !old) return false
  const options = EXERCISES.filter(
    (e) =>
      e.pattern === old.pattern && e.region === old.region && !session.exerciseIds.includes(e.id) &&
      !settings.excludedExerciseIds.includes(e.id) && !settings.disabledEquipment.includes(e.equipment),
  )
  if (!options.length) return false
  const replacement = options[Math.floor(Math.random() * options.length)]
  const existing = await db.sets.where('sessionId').equals(sessionId).filter((s) => s.exerciseId === oldId).toArray()
  const t = targetFor(replacement, perf, settings)
  const weight = session.deload ? roundTo(t.weight * DELOAD_WEIGHT_FACTOR, replacement.increment) : t.weight
  await db.transaction('rw', db.sessions, db.sets, async () => {
    await db.sets.bulkDelete(existing.map((s) => s.id!))
    await db.sets.bulkAdd(setRows(sessionId, {
      exercise: replacement, sets: existing.length, targetReps: t.reps, targetWeight: weight,
    }))
    await db.sessions.update(sessionId, {
      exerciseIds: session.exerciseIds.map((id) => (id === oldId ? replacement.id : id)),
    })
  })
  return true
}

export async function finishSession(sessionId: number): Promise<void> {
  await db.sessions.update(sessionId, { status: 'done' })
}

export async function discardSession(sessionId: number): Promise<void> {
  await db.transaction('rw', db.sessions, db.sets, async () => {
    await db.sets.where('sessionId').equals(sessionId).delete()
    await db.sessions.delete(sessionId)
  })
}
