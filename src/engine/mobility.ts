import type { MobilityMove, SessionType } from '../types'

type Focus = MobilityMove['focus']

const WARMUP_FOCUS: Record<SessionType, Focus[]> = {
  lower: ['hips', 'hips', 'thoracic'],
  upper: ['thoracic', 'shoulders', 'shoulders'],
}
const FINISHER_FOCUS: Record<SessionType, Focus[]> = {
  lower: ['balance', 'grip-carry'],
  upper: ['grip-carry', 'balance'],
}

function selectByFocus(
  library: MobilityMove[], kind: MobilityMove['kind'], focuses: Focus[],
  avoidIds: string[], rand: () => number,
): MobilityMove[] {
  const out: MobilityMove[] = []
  for (const focus of focuses) {
    let pool = library.filter((m) => m.kind === kind && m.focus === focus && !out.includes(m))
    const fresh = pool.filter((m) => !avoidIds.includes(m.id))
    if (fresh.length) pool = fresh
    if (pool.length) out.push(pool[Math.floor(rand() * pool.length)])
  }
  return out
}

export function pickMobility(
  type: SessionType, library: MobilityMove[], lastIds: string[] = [], rand: () => number = Math.random,
): { warmup: MobilityMove[]; finisher: MobilityMove[] } {
  return {
    warmup: selectByFocus(library, 'warmup', WARMUP_FOCUS[type], lastIds, rand),
    finisher: selectByFocus(library, 'finisher', FINISHER_FOCUS[type], lastIds, rand),
  }
}
