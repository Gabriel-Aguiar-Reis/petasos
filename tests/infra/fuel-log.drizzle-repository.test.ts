import { FuelLog } from '@/src/domain/entities/fuel-log'
import { DrizzleFuelLogRepository } from '@/src/infra/repositories/fuel-log.drizzle-repository'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { createTestDb } from './helpers/db'

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d)

function makeFuelLog(
  id: string,
  overrides: Partial<{
    date: Date
    fuelType: string
    liters: number
    totalPrice: number
    odometer: number
  }> = {}
) {
  return FuelLog.reconstitute({
    id,
    date: overrides.date ?? D(2024, 1, 1),
    fuelType: overrides.fuelType ?? 'Gasoline',
    liters: overrides.liters ?? 30,
    totalPrice: overrides.totalPrice ?? 150,
    odometer: overrides.odometer ?? 10000,
  })
}

describe('DrizzleFuelLogRepository (integration)', () => {
  let repo: DrizzleFuelLogRepository

  beforeEach(() => {
    repo = new DrizzleFuelLogRepository(createTestDb())
  })

  it('create — inserts and returns the fuel log', async () => {
    const log = makeFuelLog('f1')
    expect(await repo.create(log)).toBe(log)
  })

  it('findById — returns the stored fuel log', async () => {
    await repo.create(makeFuelLog('f1', { fuelType: 'Ethanol', liters: 20 }))
    const found = await repo.findById('f1')
    expect(found.fuelType).toBe('Ethanol')
    expect(found.liters).toBe(20)
  })

  it('findById — throws NotFoundError when not found', async () => {
    await expect(repo.findById('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('findAll — returns all fuel logs', async () => {
    await repo.create(makeFuelLog('f1'))
    await repo.create(makeFuelLog('f2', { odometer: 11000 }))
    expect(await repo.findAll()).toHaveLength(2)
  })

  it('findAll — returns empty array', async () => {
    expect(await repo.findAll()).toEqual([])
  })

  it('findByFuelTypeOrderedByOdometer — returns logs for given type ordered by odometer asc', async () => {
    await repo.create(
      makeFuelLog('f1', { fuelType: 'Gasoline', odometer: 15000 })
    )
    await repo.create(
      makeFuelLog('f2', { fuelType: 'Gasoline', odometer: 10000 })
    )
    await repo.create(makeFuelLog('f3', { fuelType: 'Ethanol', odometer: 5000 }))
    const result = await repo.findByFuelTypeOrderedByOdometer('Gasoline')
    expect(result).toHaveLength(2)
    expect(result[0].odometer).toBe(10000)
    expect(result[1].odometer).toBe(15000)
  })

  it('findByFuelTypeOrderedByOdometer — returns empty when no match', async () => {
    await repo.create(makeFuelLog('f1', { fuelType: 'Gasoline' }))
    expect(await repo.findByFuelTypeOrderedByOdometer('Diesel')).toEqual([])
  })

  it('update — persists all fields', async () => {
    await repo.create(makeFuelLog('f1'))
    const updated = makeFuelLog('f1', {
      fuelType: 'Diesel',
      liters: 50,
      totalPrice: 300,
      odometer: 20000,
    })
    await repo.update(updated)
    const fetched = await repo.findById('f1')
    expect(fetched.fuelType).toBe('Diesel')
    expect(fetched.liters).toBe(50)
    expect(fetched.odometer).toBe(20000)
  })

  it('update — throws NotFoundError when not found', async () => {
    await expect(repo.update(makeFuelLog('ghost'))).rejects.toBeInstanceOf(
      NotFoundError
    )
  })

  it('delete — removes the fuel log', async () => {
    await repo.create(makeFuelLog('f1'))
    await repo.delete('f1')
    await expect(repo.findById('f1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('delete — throws NotFoundError when not found', async () => {
    await expect(repo.delete('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('create — throws StorageError on duplicate primary key', async () => {
    await repo.create(makeFuelLog('f1'))
    await expect(repo.create(makeFuelLog('f1'))).rejects.toBeInstanceOf(
      StorageError
    )
  })
})
