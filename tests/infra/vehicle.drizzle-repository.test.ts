import { Vehicle } from '@/src/domain/entities/vehicle'
import { DrizzleVehicleRepository } from '@/src/infra/repositories/vehicle.drizzle-repository'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { createTestDb } from './helpers/db'

function makeVehicle(id: string, name: string, plate: string | null = null) {
  return Vehicle.reconstitute({ id, name, plate })
}

describe('DrizzleVehicleRepository (integration)', () => {
  let repo: DrizzleVehicleRepository

  beforeEach(() => {
    repo = new DrizzleVehicleRepository(createTestDb())
  })

  it('create — inserts and returns the vehicle', async () => {
    const v = makeVehicle('v1', 'Civic', 'ABC-1234')
    const result = await repo.create(v)
    expect(result).toBe(v)
  })

  it('findById — returns the vehicle', async () => {
    const v = makeVehicle('v1', 'Civic', 'ABC-1234')
    await repo.create(v)
    const found = await repo.findById('v1')
    expect(found.id).toBe('v1')
    expect(found.name).toBe('Civic')
    expect(found.plate).toBe('ABC-1234')
  })

  it('findById — returns vehicle with null plate', async () => {
    await repo.create(makeVehicle('v1', 'Moto', null))
    const found = await repo.findById('v1')
    expect(found.plate).toBeNull()
  })

  it('findById — throws NotFoundError when vehicle does not exist', async () => {
    await expect(repo.findById('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('findAll — returns all vehicles', async () => {
    await repo.create(makeVehicle('v1', 'Civic'))
    await repo.create(makeVehicle('v2', 'Moto'))
    const all = await repo.findAll()
    expect(all).toHaveLength(2)
  })

  it('findAll — returns empty array when no vehicles', async () => {
    expect(await repo.findAll()).toEqual([])
  })

  it('update — persists the changes', async () => {
    await repo.create(makeVehicle('v1', 'Civic', 'OLD-0000'))
    const updated = makeVehicle('v1', 'Civic Updated', 'NEW-9999')
    const result = await repo.update(updated)
    expect(result.name).toBe('Civic Updated')
    const fetched = await repo.findById('v1')
    expect(fetched.name).toBe('Civic Updated')
    expect(fetched.plate).toBe('NEW-9999')
  })

  it('update — throws NotFoundError when vehicle does not exist', async () => {
    await expect(repo.update(makeVehicle('ghost', 'X'))).rejects.toBeInstanceOf(
      NotFoundError
    )
  })

  it('delete — removes the vehicle', async () => {
    await repo.create(makeVehicle('v1', 'Civic'))
    await repo.delete('v1')
    await expect(repo.findById('v1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('delete — throws NotFoundError when vehicle does not exist', async () => {
    await expect(repo.delete('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('create — throws StorageError on duplicate primary key', async () => {
    await repo.create(makeVehicle('v1', 'Civic'))
    await expect(repo.create(makeVehicle('v1', 'Dup'))).rejects.toBeInstanceOf(
      StorageError
    )
  })
})
