import { create } from 'zustand'

export type Tab = 'today' | 'progress' | 'log' | 'settings'

interface AppState {
  tab: Tab
  setTab: (t: Tab) => void
  /** Session currently shown full-screen (in progress or its summary). */
  openSessionId: number | null
  openSession: (id: number | null) => void
  restEndsAt: number | null
  startRest: (seconds: number) => void
  clearRest: () => void
}

export const useApp = create<AppState>((set) => ({
  tab: 'today',
  setTab: (tab) => set({ tab }),
  openSessionId: null,
  openSession: (openSessionId) => set({ openSessionId }),
  restEndsAt: null,
  startRest: (seconds) => set({ restEndsAt: Date.now() + seconds * 1000 }),
  clearRest: () => set({ restEndsAt: null }),
}))
