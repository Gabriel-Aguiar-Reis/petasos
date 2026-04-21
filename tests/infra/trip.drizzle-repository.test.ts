import { Trip } from '@/src/domain/entities/trip'
import { Vehicle } from '@/src/domain/entities/vehicle'
import type * as schema from '@/src/infra/db/schema'
import { DrizzleTripRepository } from '@/src/infra/repositories/trip.drizzle-repository'
import { DrizzleVehicleRepository } from '@/src/infra/repositories/vehicle.drizzle-repository'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'
import { createTestDb } from './helpers/db'

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d)

function makeTrip(
  id: string,
  overrides: Partial<{
    date: Date
    earnings: number
    platformId: string
    distance: number | null
    duration: number | null
    origin: string | null
    destination: string | null
    vehicleId: string | null
  }> = {}
) {
  return Trip.reconstitute({
    id,
    date: overrides.date ?? D(2024, 1, 1),
    earnings: overrides.earnings ?? 100,
    platformId: overrides.platformId ?? 'Uber',
    distance: overrides.distance ?? null,
    duration: overrides.duration ?? null,
    origin: overrides.origin ?? null,
    destination: overrides.destination ?? null,
    vehicleId: overrides.vehicleId ?? null,
  })
}

describe('DrizzleTripRepository (integration)', () => {
  let repo: DrizzleTripRepository
  let vehicleRepo: DrizzleVehicleRepository
  let db: ExpoSQLiteDatabase<typeof schema>

  beforeEach(() => {
    db = createTestDb()
    repo = new DrizzleTripRepository(db)
    vehicleRepo = new DrizzleVehicleRepository(db)
  })

  it('create — inserts and returns the trip', async () => {
    const t = makeTrip('t1')
    expect(await repo.create(t)).toBe(t)
  })

  it('findById — returns the stored trip', async () => {
    await repo.create(makeTrip('t1', { earnings: 55.5, platformId: '99' }))
    const found = await repo.findById('t1')
    expect(found.id).toBe('t1')
    expect(found.earnings).toBe(55.5)
    expect(found.platformId).toBe('99')
  })

  it('findById — maps nullable fields correctly', async () => {
    await repo.create(
      makeTrip('t1', {
        distance: 12.5,
        duration: 30,
        origin: 'A',
        destination: 'B',
      })
    )
    const found = await repo.findById('t1')
    expect(found.distance).toBe(12.5)
    expect(found.duration).toBe(30)
    expect(found.origin).toBe('A')
    expect(found.destination).toBe('B')
  })

  it('findById — throws NotFoundError when not found', async () => {
    await expect(repo.findById('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('findAll — returns all trips', async () => {
    await repo.create(makeTrip('t1'))
    await repo.create(makeTrip('t2'))
    expect(await repo.findAll()).toHaveLength(2)
  })

  it('findAll — returns empty array', async () => {
    expect(await repo.findAll()).toEqual([])
  })

  it('findByFilter — no filters returns all', async () => {
    await repo.create(makeTrip('t1'))
    await repo.create(makeTrip('t2'))
    expect(await repo.findByFilter({})).toHaveLength(2)
  })

  it('findByFilter — dateRange filters correctly', async () => {
    await repo.create(makeTrip('t1', { date: D(2024, 1, 10) }))
    await repo.create(makeTrip('t2', { date: D(2024, 2, 10) }))
    const result = await repo.findByFilter({
      dateRange: { from: D(2024, 1, 1), to: D(2024, 1, 31) },
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('t1')
  })

  it('findByFilter — platform filters correctly', async () => {
    await repo.create(makeTrip('t1', { platformId: 'Uber' }))
    await repo.create(makeTrip('t2', { platformId: '99' }))
    const result = await repo.findByFilter({ platform: 'Uber' })
    expect(result).toHaveLength(1)
    expect(result[0].platformId).toBe('Uber')
  })

  it('findByFilter — vehicleId filters correctly', async () => {
    await vehicleRepo.create(
      Vehicle.reconstitute({
        id: 'v1',
        name: 'Car',
        plate: '',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        fuelTypeId: 'ft1',
        typeId: 'vt1',
      })
    )
    await vehicleRepo.create(
      Vehicle.reconstitute({
        id: 'v2',
        name: 'Moto',
        plate: '',
        brand: 'Honda',
        model: 'CG',
        year: 2021,
        fuelTypeId: 'ft1',
        typeId: 'vt2',
      })
    )
    await repo.create(makeTrip('t1', { vehicleId: 'v1' }))
    await repo.create(makeTrip('t2', { vehicleId: 'v2' }))
    const result = await repo.findByFilter({ vehicleId: 'v1' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('t1')
  })

  it('update — persists all fields', async () => {
    await repo.create(makeTrip('t1'))
    const updated = makeTrip('t1', {
      earnings: 200,
      platformId: 'InDriver',
      distance: 50,
      duration: 60,
      origin: 'X',
      destination: 'Y',
    })
    await repo.update(updated)
    const fetched = await repo.findById('t1')
    expect(fetched.earnings).toBe(200)
    expect(fetched.platformId).toBe('InDriver')
    expect(fetched.distance).toBe(50)
    expect(fetched.destination).toBe('Y')
  })

  it('update — throws NotFoundError when not found', async () => {
    await expect(repo.update(makeTrip('ghost'))).rejects.toBeInstanceOf(
      NotFoundError
    )
  })

  it('delete — removes the trip', async () => {
    await repo.create(makeTrip('t1'))
    await repo.delete('t1')
    await expect(repo.findById('t1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('delete — throws NotFoundError when not found', async () => {
    await expect(repo.delete('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('create — throws StorageError on duplicate primary key', async () => {
    await repo.create(makeTrip('t1'))
    await expect(repo.create(makeTrip('t1'))).rejects.toBeInstanceOf(
      StorageError
    )
  })
})
