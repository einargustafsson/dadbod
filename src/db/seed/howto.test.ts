import { describe, expect, it } from 'vitest'
import { EXERCISES } from './exercises'
import { HOWTO, demoUrl } from './howto'

describe('howto', () => {
  it('has instructions for every exercise and none for unknown ids', () => {
    const ids = new Set(EXERCISES.map((e) => e.id))
    expect(EXERCISES.filter((e) => !HOWTO[e.id]).map((e) => e.id)).toEqual([])
    expect(Object.keys(HOWTO).filter((id) => !ids.has(id))).toEqual([])
  })
  it('has non-empty steps and a cue', () => {
    for (const [id, h] of Object.entries(HOWTO)) {
      expect(h.steps.every((s) => s.length > 10), id).toBe(true)
      expect(h.cue.length, id).toBeGreaterThan(10)
    }
  })
  it('builds a safe demo link and prefers a valid custom URL', () => {
    expect(demoUrl({ name: 'Pull-Up' })).toBe('https://www.youtube.com/results?search_query=Pull-Up%20proper%20form')
    expect(demoUrl({ name: 'Pull-Up' }, 'https://youtu.be/abc')).toBe('https://youtu.be/abc')
    expect(demoUrl({ name: 'Pull-Up' }, 'javascript:alert(1)')).toContain('youtube.com/results')
  })
})
