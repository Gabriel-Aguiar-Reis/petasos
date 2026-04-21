import { ValidationError, NotFoundError } from '@/src/lib/errors'

import { UpdatePlatformProfitGoal } from '@/src/application/use-cases/platform-profit-goal/update-platform-profit-goal.use-case'
import { UpdateProfit } from '@/src/application/use-cases/profit/update-profit.use-case'
import { UpdateReminder } from '@/src/application/use-cases/reminder/update-reminder.use-case'
import { UpdateSavedProfitGoal } from '@/src/application/use-cases/saved-profit-goal/update-saved-profit-goal.use-case'
import { UpdateTripPlatform } from '@/src/application/use-cases/trip-platform/update-trip-platform.use-case'
import { UpdateVehicleType } from '@/src/application/use-cases/vehicle-type/update-vehicle-type.use-case'
import { UpdateFuelType } from '@/src/application/use-cases/fuel-type/update-fuel-type.use-case'

describe('Update use-cases branch coverage', () => {
  it('UpdatePlatformProfitGoal: validation, not found, success', async () => {
    const repo: any = {
      findById: async (id: string) => ({ id, platformId: 'p1', targetAmount: 1, createdAt: new Date(), updatedAt: new Date() }),
      update: async (x: any) => x,
    }
    const uc = new UpdatePlatformProfitGoal(repo)

    await expect(uc.execute('id', { targetAmount: -1 } as any)).rejects.toThrow(ValidationError)

    const notFoundRepo: any = { findById: async () => null }
    const uc2 = new UpdatePlatformProfitGoal(notFoundRepo)
    await expect(uc2.execute('id', { targetAmount: 10 })).rejects.toThrow(NotFoundError)

    const res = await uc.execute('id', { targetAmount: 10 })
    expect(res.targetAmount).toBe(10)
  })

  it('UpdateProfit: validation, not found, success', async () => {
    const repo: any = { findById: async (id: string) => ({ id, date: new Date(), amount: 1, platformId: 'p' }), update: async (x: any) => x }
    const uc = new UpdateProfit(repo)
    await expect(uc.execute('id', { amount: -1 } as any)).rejects.toThrow(ValidationError)
    const uc2 = new UpdateProfit({ findById: async () => null } as any)
    await expect(uc2.execute('id', { amount: 10 })).rejects.toThrow(NotFoundError)
    const out = await uc.execute('id', { amount: 20 })
    expect(out.amount).toBe(20)
  })

  it('UpdateReminder: not found and update path', async () => {
    const repoNotFound: any = { findById: async () => null }
    const ucNF = new UpdateReminder(repoNotFound)
    await expect(ucNF.execute('id', {} as any)).rejects.toThrow(NotFoundError)

    const existing = { id: 'r1', message: 'm', date: new Date(), alarm: true, update: (input: any) => ({ ...existing, ...input }) }
    const repo: any = { findById: async () => existing, update: async (x: any) => x }
    const uc = new UpdateReminder(repo)
    const out = await uc.execute('r1', { message: 'x' })
    expect(out.message).toBe('x')
  })

  it('UpdateSavedProfitGoal: validation, not found, success', async () => {
    const repo: any = { findById: async (id: string) => ({ id, name: 'n', targetAmount: 1, createdAt: new Date(), updatedAt: new Date() }), update: async (x: any) => x }
    const uc = new UpdateSavedProfitGoal(repo)
    await expect(uc.execute('id', { targetAmount: -1 } as any)).rejects.toThrow(ValidationError)
    const uc2 = new UpdateSavedProfitGoal({ findById: async () => null } as any)
    await expect(uc2.execute('id', { targetAmount: 10 })).rejects.toThrow(NotFoundError)
    const out = await uc.execute('id', { targetAmount: 15 })
    expect(out.targetAmount).toBe(15)
  })

  it('UpdateTripPlatform: branch merges', async () => {
    const existing = { id: 'tp1', name: 'n', description: 'd', tags: ['a'] }
    const repo: any = { findById: async () => existing, update: async (x: any) => x }
    const uc = new UpdateTripPlatform(repo)
    const out = await uc.execute('tp1', { name: 'nn' })
    expect(out.name).toBe('nn')
  })

  it('UpdateVehicleType and UpdateFuelType merge branches', async () => {
    const existing = { id: 'vt1', name: 'n', tags: ['a'], description: 'd' }
    const repoVT: any = { findById: async () => existing, update: async (x: any) => x }
    const ucVT = new UpdateVehicleType(repoVT)
    const out = await ucVT.execute('vt1', { name: 'new' })
    expect(out.name).toBe('new')

    const repoFT: any = { findById: async () => ({ id: 'f1', name: 'f' }), update: async (x: any) => x }
    const ucFT = new UpdateFuelType(repoFT)
    const out2 = await ucFT.execute('f1', { name: 'fuelX' } as any)
    expect(out2.name).toBe('fuelX')
  })
})
