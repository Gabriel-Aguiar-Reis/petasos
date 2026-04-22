import { SpecialDay } from '@/src/domain/entities/special-day'
import { ConflictError, NotFoundError } from '@/src/lib/errors'

import { InMemoryFuelConsumptionRecordRepository } from './fakes/InMemoryFuelConsumptionRecordRepository'
import { InMemoryFuelPriceRecordRepository } from './fakes/InMemoryFuelPriceRecordRepository'
import { InMemoryMileageRecordRepository } from './fakes/InMemoryMileageRecordRepository'
import { InMemoryPlannedAbsenceRepository } from './fakes/InMemoryPlannedAbsenceRepository'
import { InMemoryPlatformProfitGoalRepository } from './fakes/InMemoryPlatformProfitGoalRepository'
import { InMemoryProfitRepository } from './fakes/InMemoryProfitRepository'
import { InMemorySpecialDayRepository } from './fakes/InMemorySpecialDayRepository'
import { InMemoryTripOfferRecordRepository } from './fakes/InMemoryTripOfferRecordRepository'

describe('In-memory fake repositories basic operations', () => {
  it('FuelConsumptionRecord repo CRUD', async () => {
    const repo = new InMemoryFuelConsumptionRecordRepository()
    const rec = {
      id: 'r1',
      date: new Date(),
      vehicleId: 'v1',
      fuelTypeId: 'ft1',
      startMileage: 0,
      endMileage: 100,
      fuelAdded: 10,
      averageConsumption: 10,
    }

    await repo.create(rec as any)
    expect(await repo.findById('r1')).toEqual(rec)
    expect(await repo.findByVehicle('v1')).toEqual([rec])
    expect(await repo.findAll()).toEqual([rec])
    await repo.delete('r1')
    expect(await repo.findById('r1')).toBeNull()
  })

  it('FuelPriceRecord repo latest and delete', async () => {
    const repo = new InMemoryFuelPriceRecordRepository()
    const p1 = {
      id: 'p1',
      fuelTypeId: 'ft1',
      date: new Date('2025-01-01'),
      pricePerLiter: 5,
    }
    const p2 = {
      id: 'p2',
      fuelTypeId: 'ft1',
      date: new Date('2025-02-01'),
      pricePerLiter: 6,
    }
    await repo.create(p1 as any)
    await repo.create(p2 as any)
    const latest = await repo.findLatestByFuelType('ft1')
    expect(latest?.id).toBe('p2')
    await repo.delete('p1')
    expect((await repo.findAll()).map((r) => r.id)).toEqual(['p2'])
  })

  it('MileageRecord repo latest, list and delete-not-found', async () => {
    const repo = new InMemoryMileageRecordRepository()
    const m1 = {
      id: 'm1',
      vehicleId: 'v1',
      mileage: 100,
      date: new Date('2025-01-01'),
    }
    const m2 = {
      id: 'm2',
      vehicleId: 'v1',
      mileage: 200,
      date: new Date('2025-02-01'),
    }
    await repo.create(m1 as any)
    await repo.create(m2 as any)
    const latest = await repo.findLatestByVehicle('v1')
    expect(latest?.id).toBe('m2')
    const list = await repo.findByVehicle('v1')
    expect(list.map((r) => r.id)).toEqual(['m2', 'm1'])
    await expect(repo.delete('not-found')).rejects.toThrow(NotFoundError)
    const empty = new (
      await import('./fakes/InMemoryMileageRecordRepository')
    ).InMemoryMileageRecordRepository()
    expect(await empty.findLatestByVehicle('nope')).toBeNull()
    await repo.delete('m1')
  })

  it('PlannedAbsence repo basic ops', async () => {
    const repo = new InMemoryPlannedAbsenceRepository()
    const a = { id: 'a1', type: 'day_off', date: new Date('2025-03-01') }
    await repo.create(a as any)
    expect(await repo.findById('a1')).not.toBeNull()
    const hits = await repo.findByDateRange(
      new Date('2025-01-01'),
      new Date('2025-12-31')
    )
    expect(hits.length).toBeGreaterThan(0)
    await repo.update({ ...a, notes: 'x' } as any)
    await repo.delete('a1')
    expect(await repo.findById('a1')).toBeNull()
  })

  it('PlatformProfitGoal repo findByPlatform', async () => {
    const repo = new InMemoryPlatformProfitGoalRepository()
    const g = {
      id: 'g1',
      platformId: 'pl1',
      targetAmount: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await repo.create(g as any)
    const byPlatform = await repo.findByPlatform('pl1')
    expect(byPlatform.map((x) => x.id)).toEqual(['g1'])
    await repo.update({ ...g, targetAmount: 20 } as any)
    await repo.delete('g1')
  })

  it('Profit repo date range', async () => {
    const repo = new InMemoryProfitRepository()
    const p = {
      id: 'p1',
      date: new Date('2025-04-01'),
      amount: 10,
      platformId: 'pl1',
    }
    await repo.create(p as any)
    const found = await repo.findByDateRange(
      new Date('2025-01-01'),
      new Date('2025-12-31')
    )
    expect(found.length).toBe(1)
    const all = await repo.findAll()
    expect(all.length).toBeGreaterThan(0)
    await repo.update({ ...p, amount: 20 } as any)
    expect((await repo.findById('p1'))?.amount).toBe(20)
    await repo.delete('p1')
  })

  it('SpecialDay repo upsertOfficial and delete conflict', async () => {
    const repo = new InMemorySpecialDayRepository()
    const sd = SpecialDay.reconstitute({
      id: 's1',
      date: new Date('2025-05-01'),
      description: 'D',
      source: 'official',
    })
    await repo.create(sd as any)
    await expect(repo.delete('s1')).rejects.toThrow(ConflictError)

    // upsertOfficial deduplication: insert official with same date but different id
    const sd2 = SpecialDay.reconstitute({
      id: 's2',
      date: new Date('2025-05-01'),
      description: 'D2',
      source: 'official',
    })
    await repo.upsertOfficial(sd2 as any)
    const hits = await repo.findByYear(2025)
    expect(hits.some((h) => h.id === 's2')).toBeTruthy()
    const byRange = await repo.findByDateRange(
      new Date('2025-01-01'),
      new Date('2025-12-31')
    )
    expect(byRange.length).toBeGreaterThan(0)
    const sd3 = SpecialDay.reconstitute({
      id: 's3',
      date: new Date('2025-08-01'),
      description: 'U',
      source: 'custom',
    })
    await repo.create(sd3 as any)
    await repo.delete('s3')
  })

  it('TripOfferRecord repo date range and delete', async () => {
    const repo = new InMemoryTripOfferRecordRepository()
    const t1 = { id: 't1', date: new Date('2025-06-01') }
    const t2 = { id: 't2', date: new Date('2025-07-01') }
    await repo.create(t1 as any)
    await repo.create(t2 as any)
    const range = await repo.findByDateRange(
      new Date('2025-06-01'),
      new Date('2025-06-30')
    )
    expect(range.map((r) => r.id)).toEqual(['t1'])
    const all = await repo.findAll()
    expect(all.length).toBeGreaterThan(0)
    await repo.delete('t1')
    await repo.delete('not-existing')
  })

  it('Maintenance repo basic ops', async () => {
    const { InMemoryMaintenanceRepository } =
      await import('./fakes/InMemoryMaintenanceRepository')
    const repo = new InMemoryMaintenanceRepository()
    const m = {
      id: 'mX',
      vehicleId: 'v1',
      title: 'T',
      estimatedCost: 10,
      trigger: { type: 'date', date: new Date('2025-01-01') },
    }
    await repo.create(m as any)
    expect(await repo.findById('mX')).not.toBeNull()
    expect((await repo.findByVehicle('v1')).length).toBeGreaterThan(0)
    expect((await repo.findPending()).length).toBeGreaterThan(0)
    await repo.update({ ...m, title: 'T2' } as any)
    await repo.delete('mX')
  })

  it('Reminder and SavedProfitGoal repo basic ops', async () => {
    const { InMemoryReminderRepository } =
      await import('./fakes/InMemoryReminderRepository')
    const reminderRepo = new InMemoryReminderRepository()
    const r = { id: 'rm1', message: 'hi', date: new Date(), alarm: false }
    await reminderRepo.create(r as any)
    expect(await reminderRepo.findById('rm1')).not.toBeNull()
    expect((await reminderRepo.findAll()).length).toBeGreaterThan(0)
    await reminderRepo.update({ ...r, message: 'updated' } as any)
    await reminderRepo.delete('rm1')

    const { InMemorySavedProfitGoalRepository } =
      await import('./fakes/InMemorySavedProfitGoalRepository')
    const spRepo = new InMemorySavedProfitGoalRepository()
    const g = {
      id: 'sg1',
      name: 'n',
      targetAmount: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await spRepo.create(g as any)
    expect(await spRepo.findById('sg1')).not.toBeNull()
    const allSaved = await spRepo.findAll()
    expect(allSaved.length).toBeGreaterThan(0)
    await spRepo.update({ ...g, targetAmount: 20 } as any)
    await spRepo.delete('sg1')
  })
})
