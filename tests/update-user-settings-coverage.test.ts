import { UpdateUserSettings } from '@/src/application/use-cases/user-settings/update-user-settings.use-case'

describe('UpdateUserSettings coverage', () => {
  it('updates nested displayPreferences fields when provided', async () => {
    const current = {
      id: 'u1',
      userId: 'user-1',
      preferredUnits: 'km',
      currency: 'USD',
      displayPreferences: {
        showCosts: false,
        showProfits: true,
        showMaintenance: true,
        showReminders: true,
      },
      starredTool: null,
      tripOfferPill: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }

    const repo: any = {
      get: async () => current,
      upsert: async (u: any) => u,
    }

    const uc = new UpdateUserSettings(repo)
    const res = await uc.execute({ displayPreferences: { showCosts: true } })
    expect(res.displayPreferences.showCosts).toBe(true)
    expect(res.displayPreferences.showProfits).toBe(true)
  })

  it('falls back to current nested field when inner value is undefined', async () => {
    const current = {
      id: 'u3',
      userId: 'user-3',
      preferredUnits: 'km',
      currency: 'USD',
      displayPreferences: {
        showCosts: false,
        showProfits: true,
        showMaintenance: true,
        showReminders: true,
      },
      starredTool: null,
      tripOfferPill: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }

    const repo: any = { get: async () => current, upsert: async (u: any) => u }
    const uc = new UpdateUserSettings(repo)
    const res = await uc.execute({
      displayPreferences: { showCosts: undefined } as any,
    })
    expect(res.displayPreferences.showCosts).toBe(false)
  })

  it('keeps displayPreferences when not provided', async () => {
    const current = {
      id: 'u2',
      userId: 'user-2',
      preferredUnits: 'km',
      currency: 'EUR',
      displayPreferences: {
        showCosts: true,
        showProfits: false,
        showMaintenance: false,
        showReminders: false,
      },
      starredTool: null,
      tripOfferPill: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }

    const repo: any = { get: async () => current, upsert: async (u: any) => u }
    const uc = new UpdateUserSettings(repo)
    const res = await uc.execute({ preferredUnits: 'mpg' })
    expect(res.preferredUnits).toBe('mpg')
    expect(res.displayPreferences).toEqual(current.displayPreferences)
  })
})
