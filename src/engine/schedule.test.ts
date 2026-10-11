import { describe, expect, it } from 'vitest'
import type { Ride, Run, Session } from '../types'
import { nextSession } from './schedule'

const s = (date: string, type: Session['type'], id: number): Session => ({
  id, date, type, status: 'done', deload: false, exerciseIds: [], warmupIds: [], finisherIds: [],
})
const run = (date: string, distanceKm: number, effort: Run['effort'] = 2): Run => ({ date, distanceKm, durationMin: 60, effort })

const ride = (date: string, distanceKm: number, effort: Ride['effort'] = 2): Ride => ({ date, distanceKm, durationMin: 120, effort })

describe('nextSession', () => {
  it('starts with upper', () => {
    expect(nextSession([], [], '2026-10-11').type).toBe('upper')
  })
  it('alternates', () => {
    expect(nextSession([s('2026-10-08', 'upper', 1)], [], '2026-10-11').type).toBe('lower')
    expect(nextSession([s('2026-10-08', 'lower', 1)], [], '2026-10-11').type).toBe('upper')
  })
  it('ignores planned sessions', () => {
    const planned = { ...s('2026-10-10', 'lower', 2), status: 'planned' as const }
    expect(nextSession([s('2026-10-08', 'lower', 1), planned], [], '2026-10-11').type).toBe('upper')
  })
  it('swaps lower for upper after a long run', () => {
    const r = nextSession([s('2026-10-08', 'upper', 1)], [run('2026-10-10', 14)], '2026-10-11')
    expect(r.type).toBe('upper')
    expect(r.reducedVolume).toBe(false)
  })
  it('swaps lower for upper after a hard-effort short run', () => {
    expect(nextSession([s('2026-10-08', 'upper', 1)], [run('2026-10-11', 5, 4)], '2026-10-11').type).toBe('upper')
  })
  it('ignores easy or old runs', () => {
    expect(nextSession([s('2026-10-08', 'upper', 1)], [run('2026-10-10', 6, 2)], '2026-10-11').type).toBe('lower')
    expect(nextSession([s('2026-10-08', 'upper', 1)], [run('2026-10-07', 15)], '2026-10-11').type).toBe('lower')
  })
  it('keeps lower with reduced volume after two uppers in a row', () => {
    const r = nextSession([s('2026-10-06', 'upper', 1), s('2026-10-08', 'upper', 2)], [run('2026-10-10', 14)], '2026-10-11')
    expect(r).toMatchObject({ type: 'lower', reducedVolume: true })
  })
  it('swaps lower for upper after a long or hard ride', () => {
    const history = [s('2026-10-08', 'upper', 1)]
    expect(nextSession(history, [], '2026-10-11', [ride('2026-10-10', 60)]).type).toBe('upper')
    expect(nextSession(history, [], '2026-10-11', [ride('2026-10-11', 20, 4)]).type).toBe('upper')
  })
  it('ignores easy, short or old rides', () => {
    const history = [s('2026-10-08', 'upper', 1)]
    expect(nextSession(history, [], '2026-10-11', [ride('2026-10-10', 30, 2)]).type).toBe('lower')
    expect(nextSession(history, [], '2026-10-11', [ride('2026-10-07', 80)]).type).toBe('lower')
  })
  it('keeps lower with reduced volume after two uppers and a hard ride', () => {
    const history = [s('2026-10-06', 'upper', 1), s('2026-10-08', 'upper', 2)]
    expect(nextSession(history, [], '2026-10-11', [ride('2026-10-10', 60)])).toMatchObject({ type: 'lower', reducedVolume: true })
  })
})
