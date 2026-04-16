import { create } from 'zustand'

type ActiveSessionState = {
  activeSessionId: string | null
  startedAt: number | null // Unix ms
  startSession: (id: string, startedAt: number) => void
  endSession: () => void
}

export const useActiveSessionStore = create<ActiveSessionState>((set) => ({
  activeSessionId: null,
  startedAt: null,
  startSession: (id, startedAt) => set({ activeSessionId: id, startedAt }),
  endSession: () => set({ activeSessionId: null, startedAt: null }),
}))
