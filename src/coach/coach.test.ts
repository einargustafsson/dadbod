import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '../db/schema'
import type { Session, SetLog } from '../types'
import { buildSummary, type SummaryInput } from './summary'
import { requestReview } from './weeklyReview'

const session = (id: number, date: string, deload = false): Session => ({
  id, date, type: 'upper', status: 'done', deload, exerciseIds: ['bench'], warmupIds: [], finisherIds: [],
})
const set = (sessionId: number, reps: number, weight: number, targetReps = 5): SetLog => ({
  sessionId, exerciseId: 'bench', setNumber: 1, targetReps, targetWeight: weight, actualReps: reps, actualWeight: weight,
})

const base = (over: Partial<SummaryInput> = {}): SummaryInput => ({
  today: '2026-10-11', sessions: [], sets: [], bodyWeights: [], runs: [], rides: [], settings: DEFAULT_SETTINGS, ...over,
})

afterEach(() => vi.unstubAllGlobals())

describe('buildSummary', () => {
  it('handles an empty history', () => {
    const s = buildSummary(base())
    expect(s.goal.rateStatus).toBe('insufficient-data')
    expect(s.goal.currentTrendKg).toBeNull()
    expect(s.training).toEqual({ sessionsInWindow: 0, deloadSessions: 0, lifts: [] })
  })

  it('only counts the last 28 days', () => {
    const s = buildSummary(base({
      sessions: [session(1, '2026-09-01'), session(2, '2026-10-05', true)],
      sets: [set(1, 5, 100), set(2, 5, 60)],
      runs: [
        { date: '2026-08-01', distanceKm: 20, durationMin: 120, effort: 3 },
        { date: '2026-10-07', distanceKm: 12, durationMin: 70, effort: 3 },
      ],
    }))
    expect(s.training.sessionsInWindow).toBe(1)
    expect(s.training.deloadSessions).toBe(1)
    expect(s.training.lifts[0].lastE1rmKg).toBeCloseTo(70, 0)
    expect(s.running.weeklyKm).toEqual([{ weekStarting: '2026-10-05', km: 12 }])
  })

  it('summarizes cycling separately from running, within the window', () => {
    const s = buildSummary(base({
      runs: [{ date: '2026-10-06', distanceKm: 8, durationMin: 45, effort: 2 }],
      rides: [
        { date: '2026-08-01', distanceKm: 90, durationMin: 200, effort: 3 },
        { date: '2026-10-05', distanceKm: 30, durationMin: 80, effort: 2 },
        { date: '2026-10-08', distanceKm: 25.5, durationMin: 70, effort: 2 },
      ],
    }))
    expect(s.cycling.weeklyKm).toEqual([{ weekStarting: '2026-10-05', km: 55.5 }])
    expect(s.running.weeklyKm).toEqual([{ weekStarting: '2026-10-05', km: 8 }])
  })

  it('reports e1RM change and flags stalled lifts', () => {
    const s = buildSummary(base({
      sessions: [session(1, '2026-10-01'), session(2, '2026-10-04'), session(3, '2026-10-08')],
      sets: [set(1, 5, 60), set(2, 4, 62.5, 5), set(3, 3, 62.5, 5)],
    }))
    const bench = s.training.lifts[0]
    expect(bench).toMatchObject({ name: 'Barbell Bench Press', sessions: 3, stalled: true })
    expect(bench.firstE1rmKg).toBeCloseTo(70, 0)
  })

  it('computes the weight trend', () => {
    const bodyWeights = Array.from({ length: 15 }, (_, i) => ({ date: `2026-09-${String(20 + i).padStart(2, '0')}`, kg: 92 - i * 0.1 }))
      .filter((p) => p.date <= '2026-10-11')
    const s = buildSummary(base({ bodyWeights }))
    expect(s.goal.trendKgPerWeek).toBeLessThan(0)
    expect(s.goal.currentTrendKg).toBeLessThan(92)
  })

  it('never includes the API key or free-text fields', () => {
    const settings = { ...DEFAULT_SETTINGS, claudeKey: 'sk-ant-secret' }
    const json = JSON.stringify(buildSummary(base({ settings, sessions: [session(1, '2026-10-05')], sets: [set(1, 5, 60)] })))
    expect(json).not.toContain('sk-ant-secret')
    expect(json).not.toContain('claudeKey')
  })
})

describe('requestReview', () => {
  const okBody = {
    id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', stop_reason: 'end_turn',
    stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 },
    content: [{ type: 'text', text: 'Solid month.' }],
  }

  it('sends only the summary with the expected request shape and returns the text', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(okBody), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const summary = buildSummary(base({ sessions: [session(1, '2026-10-05')], sets: [set(1, 5, 60)] }))

    expect(await requestReview(summary, 'sk-ant-test')).toBe('Solid month.')

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    expect(body.model).toBe('claude-sonnet-5-5')
    expect(body.thinking).toBeUndefined()
    expect(body.tool_choice).toBeUndefined()
    expect(body.fallbacks).toBe('default')
    expect(body.messages).toHaveLength(1)
    expect(body.messages[0].content).toContain('Barbell Bench Press')
    expect(JSON.stringify(body)).not.toContain('sk-ant-test') // key goes in a header only
  })

  it('maps auth failures to a friendly message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'bad key' } }), { status: 401, headers: { 'content-type': 'application/json' } })))
    await expect(requestReview(buildSummary(base()), 'nope')).rejects.toThrow('rejected the API key')
  })

  it('surfaces refusals', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ...okBody, stop_reason: 'refusal', content: [] }), { status: 200, headers: { 'content-type': 'application/json' } })))
    await expect(requestReview(buildSummary(base()), 'k')).rejects.toThrow('declined')
  })
})
