import { create } from 'zustand'

type QuickEntryType = 'trip' | 'cost'

type QuickEntryState = {
  isOpen: boolean
  entryType: QuickEntryType
  openTrip: () => void
  openCost: () => void
  close: () => void
}

export const useQuickEntryStore = create<QuickEntryState>((set) => ({
  isOpen: false,
  entryType: 'trip',
  openTrip: () => set({ isOpen: true, entryType: 'trip' }),
  openCost: () => set({ isOpen: true, entryType: 'cost' }),
  close: () => set({ isOpen: false }),
}))
