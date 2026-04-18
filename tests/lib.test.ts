import { USE_MOCK } from '@/src/lib/config'
import { FUEL_TYPES } from '@/src/lib/constants/fuel-types'
import { formatCurrency, formatDuration } from '@/src/lib/format'
import { getDateRange } from '@/src/lib/getters'
import { useActiveSessionStore } from '@/src/lib/stores/active-session.store'
import { useQuickEntryStore } from '@/src/lib/stores/quick-entry.store'
import { NAV_THEME, THEME } from '@/src/lib/theme'
import { cn } from '@/src/lib/utils'

// ---------------------------------------------------------------------------
// config — USE_MOCK flag
// ---------------------------------------------------------------------------

describe('USE_MOCK', () => {
  it('is a boolean', () => {
    expect(typeof USE_MOCK).toBe('boolean')
  })
})

// ---------------------------------------------------------------------------
// FUEL_TYPES constant
// ---------------------------------------------------------------------------

describe('FUEL_TYPES', () => {
  it('contains the four expected fuel types', () => {
    expect(FUEL_TYPES).toEqual(['Gasolina', 'Etanol', 'Diesel', 'GNV'])
  })
})

// ---------------------------------------------------------------------------
// cn()
// ---------------------------------------------------------------------------

describe('cn()', () => {
  it('merges multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters falsy values', () => {
    expect(cn('foo', false && 'ignored', 'bar')).toBe('foo bar')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles undefined / null / empty string gracefully', () => {
    expect(cn(undefined, null as never, '', 'ok')).toBe('ok')
  })

  it('handles conditional object notation', () => {
    expect(cn({ 'font-bold': true, italic: false })).toBe('font-bold')
  })

  it('returns empty string when all inputs are falsy', () => {
    expect(cn(false as never, undefined, null as never)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// formatCurrency()
// ---------------------------------------------------------------------------

describe('formatCurrency()', () => {
  it('formats a positive integer in BRL', () => {
    const result = formatCurrency(1000)
    expect(result).toContain('1.000')
    expect(result).toContain('R$')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('formats a decimal value', () => {
    const result = formatCurrency(99.5)
    expect(result).toContain('99')
    expect(result).toContain('50')
  })

  it('formats small values correctly', () => {
    const result = formatCurrency(0.01)
    expect(result).toContain('0')
  })
})

// ---------------------------------------------------------------------------
// formatDuration()
// ---------------------------------------------------------------------------

describe('formatDuration()', () => {
  it('returns "0min" for 0 minutes', () => {
    expect(formatDuration(0)).toBe('0min')
  })

  it('returns minutes-only for values below 60', () => {
    expect(formatDuration(45)).toBe('45min')
  })

  it('returns hours and minutes for exactly 60', () => {
    expect(formatDuration(60)).toBe('1h 0min')
  })

  it('returns hours and minutes for values above 60', () => {
    expect(formatDuration(90)).toBe('1h 30min')
  })

  it('returns correct hours and zero minutes for multiples of 60', () => {
    expect(formatDuration(120)).toBe('2h 0min')
  })

  it('handles large durations', () => {
    expect(formatDuration(300)).toBe('5h 0min')
  })
})

// ---------------------------------------------------------------------------
// useQuickEntryStore
// ---------------------------------------------------------------------------

describe('useQuickEntryStore', () => {
  beforeEach(() => {
    useQuickEntryStore.setState({ isOpen: false, entryType: 'trip' })
  })

  it('starts with isOpen=false and entryType="trip"', () => {
    const { isOpen, entryType } = useQuickEntryStore.getState()
    expect(isOpen).toBe(false)
    expect(entryType).toBe('trip')
  })

  it('openTrip() sets isOpen=true and entryType="trip"', () => {
    useQuickEntryStore.getState().openTrip()
    const { isOpen, entryType } = useQuickEntryStore.getState()
    expect(isOpen).toBe(true)
    expect(entryType).toBe('trip')
  })

  it('openCost() sets isOpen=true and entryType="cost"', () => {
    useQuickEntryStore.getState().openCost()
    const { isOpen, entryType } = useQuickEntryStore.getState()
    expect(isOpen).toBe(true)
    expect(entryType).toBe('cost')
  })

  it('close() sets isOpen=false', () => {
    useQuickEntryStore.getState().openTrip()
    useQuickEntryStore.getState().close()
    expect(useQuickEntryStore.getState().isOpen).toBe(false)
  })

  it('close() after openCost() preserves entryType', () => {
    useQuickEntryStore.getState().openCost()
    useQuickEntryStore.getState().close()
    // entryType stays at 'cost' — only isOpen changes
    expect(useQuickEntryStore.getState().entryType).toBe('cost')
  })
})

// ---------------------------------------------------------------------------
// useActiveSessionStore
// ---------------------------------------------------------------------------

describe('useActiveSessionStore', () => {
  beforeEach(() => {
    useActiveSessionStore.setState({ activeSessionId: null, startedAt: null })
  })

  it('starts with null activeSessionId and startedAt', () => {
    const { activeSessionId, startedAt } = useActiveSessionStore.getState()
    expect(activeSessionId).toBeNull()
    expect(startedAt).toBeNull()
  })

  it('startSession() stores id and timestamp', () => {
    useActiveSessionStore.getState().startSession('sess-1', 1_000_000)
    const { activeSessionId, startedAt } = useActiveSessionStore.getState()
    expect(activeSessionId).toBe('sess-1')
    expect(startedAt).toBe(1_000_000)
  })

  it('startSession() overwrites a previous session', () => {
    useActiveSessionStore.getState().startSession('sess-1', 1_000_000)
    useActiveSessionStore.getState().startSession('sess-2', 2_000_000)
    const { activeSessionId, startedAt } = useActiveSessionStore.getState()
    expect(activeSessionId).toBe('sess-2')
    expect(startedAt).toBe(2_000_000)
  })

  it('endSession() clears id and timestamp', () => {
    useActiveSessionStore.getState().startSession('sess-1', 1_000_000)
    useActiveSessionStore.getState().endSession()
    const { activeSessionId, startedAt } = useActiveSessionStore.getState()
    expect(activeSessionId).toBeNull()
    expect(startedAt).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// THEME / NAV_THEME
// ---------------------------------------------------------------------------

describe('THEME', () => {
  it('has light and dark variants', () => {
    expect(THEME).toHaveProperty('light')
    expect(THEME).toHaveProperty('dark')
  })

  it('light variant contains required color keys', () => {
    const keys = ['background', 'foreground', 'primary', 'destructive', 'border']
    for (const key of keys) {
      expect(THEME.light).toHaveProperty(key)
    }
  })

  it('dark variant contains required color keys', () => {
    const keys = ['background', 'foreground', 'primary', 'destructive', 'border']
    for (const key of keys) {
      expect(THEME.dark).toHaveProperty(key)
    }
  })

  it('light and dark backgrounds differ', () => {
    expect(THEME.light.background).not.toBe(THEME.dark.background)
  })
})

describe('NAV_THEME', () => {
  it('has light and dark variants', () => {
    expect(NAV_THEME).toHaveProperty('light')
    expect(NAV_THEME).toHaveProperty('dark')
  })

  it('light colors reference THEME.light values', () => {
    expect(NAV_THEME.light.colors.background).toBe(THEME.light.background)
    expect(NAV_THEME.light.colors.primary).toBe(THEME.light.primary)
  })

  it('dark colors reference THEME.dark values', () => {
    expect(NAV_THEME.dark.colors.background).toBe(THEME.dark.background)
    expect(NAV_THEME.dark.colors.primary).toBe(THEME.dark.primary)
  })
})

// ---------------------------------------------------------------------------
// getDateRange()
// ---------------------------------------------------------------------------

describe('getDateRange()', () => {
  it('"today" returns from=start-of-day and to=end-of-day', () => {
    const { from, to } = getDateRange('today')
    expect(from.getHours()).toBe(0)
    expect(from.getMinutes()).toBe(0)
    expect(from.getSeconds()).toBe(0)
    expect(from.getMilliseconds()).toBe(0)
    expect(to.getHours()).toBe(23)
    expect(to.getMinutes()).toBe(59)
    expect(to.getSeconds()).toBe(59)
    expect(to.getMilliseconds()).toBe(999)
  })

  it('"today" from and to share the same date', () => {
    const { from, to } = getDateRange('today')
    expect(from.getFullYear()).toBe(to.getFullYear())
    expect(from.getMonth()).toBe(to.getMonth())
    expect(from.getDate()).toBe(to.getDate())
  })

  it('"week" from is Sunday (day 0) of the current week', () => {
    const { from } = getDateRange('week')
    expect(from.getDay()).toBe(0)
    expect(from.getHours()).toBe(0)
    expect(from.getMinutes()).toBe(0)
  })

  it('"week" to is end of current day', () => {
    const { to } = getDateRange('week')
    expect(to.getHours()).toBe(23)
    expect(to.getMinutes()).toBe(59)
    expect(to.getSeconds()).toBe(59)
    expect(to.getMilliseconds()).toBe(999)
  })

  it('"month" from is first day of current month at midnight', () => {
    const { from } = getDateRange('month')
    expect(from.getDate()).toBe(1)
    expect(from.getHours()).toBe(0)
    expect(from.getMinutes()).toBe(0)
  })

  it('"month" to is last day of current month at end-of-day', () => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const { to } = getDateRange('month')
    expect(to.getDate()).toBe(lastDay)
    expect(to.getHours()).toBe(23)
    expect(to.getMinutes()).toBe(59)
    expect(to.getSeconds()).toBe(59)
    expect(to.getMilliseconds()).toBe(999)
  })

  it('"month" from and to are in the same month', () => {
    const { from, to } = getDateRange('month')
    expect(from.getFullYear()).toBe(to.getFullYear())
    expect(from.getMonth()).toBe(to.getMonth())
  })
})
