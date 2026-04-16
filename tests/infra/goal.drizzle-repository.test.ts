import { Goal } from '@/src/domain/entities/goal'
import { DrizzleGoalRepository } from '@/src/infra/repositories/goal.drizzle-repository'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { createTestDb } from './helpers/db'

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d)

function makeGoal(
  id: string,
  overrides: Partial<{
    type: 'daily' | 'weekly' | 'monthly'
    targetAmount: number
    periodStart: Date
  }> = {}
) {
  return Goal.reconstitute({
    id,
    type: overrides.type ?? 'daily',
    targetAmount: overrides.targetAmount ?? 200,
    periodStart: overrides.periodStart ?? D(2024, 1, 1),
  })
}

describe('DrizzleGoalRepository (integration)', () => {
  let repo: DrizzleGoalRepository

  beforeEach(() => {
    repo = new DrizzleGoalRepository(createTestDb())
  })

  it('create — inserts and returns the goal', async () => {
    const g = makeGoal('g1')
    expect(await repo.create(g)).toBe(g)
  })

  it('findById — returns the stored goal', async () => {
    await repo.create(makeGoal('g1', { type: 'weekly', targetAmount: 1000 }))
    const found = await repo.findById('g1')
    expect(found.type).toBe('weekly')
    expect(found.targetAmount).toBe(1000)
  })

  it('findById — throws NotFoundError when not found', async () => {
    await expect(repo.findById('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('findAll — returns all goals', async () => {
    await repo.create(makeGoal('g1'))
    await repo.create(makeGoal('g2', { type: 'monthly' }))
    expect(await repo.findAll()).toHaveLength(2)
  })

  it('findAll — returns empty array', async () => {
    expect(await repo.findAll()).toEqual([])
  })

  it('findByType — returns goals matching the type', async () => {
    await repo.create(makeGoal('g1', { type: 'daily' }))
    await repo.create(makeGoal('g2', { type: 'monthly' }))
    await repo.create(makeGoal('g3', { type: 'daily' }))
    const result = await repo.findByType('daily')
    expect(result).toHaveLength(2)
    result.forEach((g) => expect(g.type).toBe('daily'))
  })

  it('findByType — returns empty array when no match', async () => {
    await repo.create(makeGoal('g1', { type: 'daily' }))
    expect(await repo.findByType('weekly')).toEqual([])
  })

  it('update — persists all fields', async () => {
    await repo.create(makeGoal('g1'))
    const updated = makeGoal('g1', {
      type: 'monthly',
      targetAmount: 5000,
      periodStart: D(2024, 6, 1),
    })
    await repo.update(updated)
    const fetched = await repo.findById('g1')
    expect(fetched.type).toBe('monthly')
    expect(fetched.targetAmount).toBe(5000)
  })

  it('update — throws NotFoundError when not found', async () => {
    await expect(repo.update(makeGoal('ghost'))).rejects.toBeInstanceOf(
      NotFoundError
    )
  })

  it('delete — removes the goal', async () => {
    await repo.create(makeGoal('g1'))
    await repo.delete('g1')
    await expect(repo.findById('g1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('delete — throws NotFoundError when not found', async () => {
    await expect(repo.delete('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('create — throws StorageError on duplicate primary key', async () => {
    await repo.create(makeGoal('g1'))
    await expect(repo.create(makeGoal('g1'))).rejects.toBeInstanceOf(
      StorageError
    )
  })
})
