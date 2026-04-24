// ---------------------------------------------------------------------------
// Mocks — hoisted before imports
// ---------------------------------------------------------------------------

jest.mock('react', () => ({
  useState: jest.fn(),
  useEffect: jest.fn(),
}))

jest.mock('@/src/application/hooks/use-user-settings', () => ({
  useUserSettings: jest.fn(),
}))

jest.mock('@/src/application/services/premium-validator.service', () => ({
  PremiumValidatorService: {
    isPremium: jest.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { useSecondTab } from '@/src/application/hooks/use-second-tab'
import { useUserSettings } from '@/src/application/hooks/use-user-settings'
import { PremiumValidatorService } from '@/src/application/services/premium-validator.service'
import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockSetState = jest.fn()
let capturedEffect: (() => (() => void) | void) | undefined

beforeEach(() => {
  mockSetState.mockClear()
  capturedEffect = undefined
  ;(useState as jest.Mock).mockReturnValue([null, mockSetState])
  ;(useEffect as jest.Mock).mockImplementation(
    (fn: () => (() => void) | void) => {
      capturedEffect = fn
    }
  )
  ;(useUserSettings as jest.Mock).mockReturnValue({ data: undefined })
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSecondTab', () => {
  it('returns null as initial state before effect resolves', () => {
    ;(PremiumValidatorService.isPremium as jest.Mock).mockResolvedValue(false)
    const result = useSecondTab()
    expect(result).toBeNull()
  })

  it('sets "premium" when user has not paid', async () => {
    ;(PremiumValidatorService.isPremium as jest.Mock).mockResolvedValue(false)
    useSecondTab()
    capturedEffect!()
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(mockSetState).toHaveBeenCalledWith('premium')
  })

  it('sets "trips" when user is premium and has no starredScreen', async () => {
    ;(PremiumValidatorService.isPremium as jest.Mock).mockResolvedValue(true)
    ;(useUserSettings as jest.Mock).mockReturnValue({
      data: { starredScreen: undefined },
    })
    useSecondTab()
    capturedEffect!()
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(mockSetState).toHaveBeenCalledWith('trips')
  })

  it('sets the starredScreen value when user is premium and has a preference', async () => {
    ;(PremiumValidatorService.isPremium as jest.Mock).mockResolvedValue(true)
    ;(useUserSettings as jest.Mock).mockReturnValue({
      data: { starredScreen: 'fuel' },
    })
    useSecondTab()
    capturedEffect!()
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(mockSetState).toHaveBeenCalledWith('fuel')
  })

  it('does not call setState after cleanup (mounted guard)', async () => {
    let resolveIsPremium!: (value: boolean) => void
    const pending = new Promise<boolean>((resolve) => {
      resolveIsPremium = resolve
    })
    ;(PremiumValidatorService.isPremium as jest.Mock).mockReturnValue(pending)
    useSecondTab()
    const cleanup = capturedEffect!() as () => void
    // Simulate component unmount before the async call resolves
    cleanup()
    resolveIsPremium(true)
    await new Promise<void>((resolve) => setImmediate(resolve))
    expect(mockSetState).not.toHaveBeenCalled()
  })
})
