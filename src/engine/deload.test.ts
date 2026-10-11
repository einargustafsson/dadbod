import { describe, expect, it } from 'vitest'
import type { Session } from '../types'
import { deloadDecision } from './deload'

const mk = (n: number, deload: boolean[]): Session[] =>
  deload.map((d, i): Session => ({
    id: i + 1, date: `2026-09-${String(i + 1).padStart(2, '0')}`, type: i % 2 ? 'lower' : 'upper',
    status: 'done', deload: d, exerciseIds: [], warmupIds: [], finisherIds: [],
  })).slice(0, n)

describe('deloadDecision', () => {
  it('is false early in a cycle', () => {
    expect(deloadDecision(mk(5, Array(5).fill(false)), 0).deload).toBe(false)
  })
  it('triggers after 12 loading sessions', () => {
    expect(deloadDecision(mk(12, Array(12).fill(false)), 0).deload).toBe(true)
  })
  it('triggers early on 3+ stalled lifts', () => {
    expect(deloadDecision(mk(4, Array(4).fill(false)), 3).deload).toBe(true)
    expect(deloadDecision(mk(4, Array(4).fill(false)), 2).deload).toBe(false)
  })
  it('continues a deload week until 3 deload sessions are done', () => {
    const flags = [...Array(12).fill(false), true, true]
    expect(deloadDecision(mk(14, flags), 0).deload).toBe(true)
  })
  it('resets the cycle after a full deload week', () => {
    const flags = [...Array(12).fill(false), true, true, true]
    expect(deloadDecision(mk(15, flags), 0).deload).toBe(false)
    expect(deloadDecision(mk(15, flags), 5).deload).toBe(false)
  })
})
