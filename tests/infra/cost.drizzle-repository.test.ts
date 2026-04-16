import { Cost } from '@/src/domain/entities/cost'
import { DrizzleCostRepository } from '@/src/infra/repositories/cost.drizzle-repository'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { createTestDb } from './helpers/db'

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d)

function makeCost(
  id: string,
  overrides: Partial<{
    date: Date
    amount: number
    category: string
  }> = {}
) {
  return Cost.reconstitute({
    id,
    date: overrides.date ?? D(2024, 1, 1),
    amount: overrides.amount ?? 50,
    category: overrides.category ?? 'Fuel',
  })
}

describe('DrizzleCostRepository (integration)', () => {
  let repo: DrizzleCostRepository

  beforeEach(() => {
    repo = new DrizzleCostRepository(createTestDb())
  })

  it('create — inserts and returns the cost', async () => {
    const c = makeCost('c1')
    expect(await repo.create(c)).toBe(c)
  })

  it('findById — returns the stored cost', async () => {
    await repo.create(makeCost('c1', { amount: 75.5, category: 'Maintenance' }))
    const found = await repo.findById('c1')
    expect(found.id).toBe('c1')
    expect(found.amount).toBe(75.5)
    expect(found.category).toBe('Maintenance')
  })

  it('findById — throws NotFoundError when not found', async () => {
    await expect(repo.findById('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('findAll — returns all costs', async () => {
    await repo.create(makeCost('c1'))
    await repo.create(makeCost('c2'))
    expect(await repo.findAll()).toHaveLength(2)
  })

  it('findAll — returns empty array', async () => {
    expect(await repo.findAll()).toEqual([])
  })

  it('findByFilter — no filters returns all', async () => {
    await repo.create(makeCost('c1'))
    await repo.create(makeCost('c2'))
    expect(await repo.findByFilter({})).toHaveLength(2)
  })

  it('findByFilter — dateRange filters correctly', async () => {
    await repo.create(makeCost('c1', { date: D(2024, 1, 10) }))
    await repo.create(makeCost('c2', { date: D(2024, 3, 1) }))
    const result = await repo.findByFilter({
      dateRange: { from: D(2024, 1, 1), to: D(2024, 1, 31) },
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('findByFilter — category filters correctly', async () => {
    await repo.create(makeCost('c1', { category: 'Fuel' }))
    await repo.create(makeCost('c2', { category: 'Maintenance' }))
    const result = await repo.findByFilter({ category: 'Fuel' })
    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('Fuel')
  })

  it('update — persists all fields', async () => {
    await repo.create(makeCost('c1'))
    const updated = makeCost('c1', {
      amount: 200,
      category: 'Insurance',
      date: D(2024, 6, 15),
    })
    await repo.update(updated)
    const fetched = await repo.findById('c1')
    expect(fetched.amount).toBe(200)
    expect(fetched.category).toBe('Insurance')
  })

  it('update — throws NotFoundError when not found', async () => {
    await expect(repo.update(makeCost('ghost'))).rejects.toBeInstanceOf(
      NotFoundError
    )
  })

  it('delete — removes the cost', async () => {
    await repo.create(makeCost('c1'))
    await repo.delete('c1')
    await expect(repo.findById('c1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('delete — throws NotFoundError when not found', async () => {
    await expect(repo.delete('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('create — throws StorageError on duplicate primary key', async () => {
    await repo.create(makeCost('c1'))
    await expect(repo.create(makeCost('c1'))).rejects.toBeInstanceOf(
      StorageError
    )
  })
})
