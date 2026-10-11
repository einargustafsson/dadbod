import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXERCISE_BY_ID } from './exercises'
import { MEDIA_IDS } from './media'

describe('exercise media', () => {
  it('only lists real exercises', () => {
    expect([...MEDIA_IDS].filter((id) => !EXERCISE_BY_ID[id])).toEqual([])
  })
  it('has both frames on disk for every listed exercise, and no orphan folders', () => {
    const root = path.resolve(__dirname, '../../../public/exercises')
    for (const id of MEDIA_IDS) {
      for (const i of [0, 1]) {
        const file = path.join(root, id, `${i}.jpg`)
        expect(fs.existsSync(file), file).toBe(true)
        expect(fs.statSync(file).size, file).toBeGreaterThan(2_000)
      }
    }
    expect(fs.readdirSync(root).filter((d) => !MEDIA_IDS.has(d))).toEqual([])
  })
})
