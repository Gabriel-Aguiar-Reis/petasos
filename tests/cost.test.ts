import { CreateCost } from '@/src/application/use-cases/cost/create-cost.use-case'
import { DeleteCost } from '@/src/application/use-cases/cost/delete-cost.use-case'
import { GetCostsByFilter } from '@/src/application/use-cases/cost/get-cost-by-filter.use-case'
import { UpdateCost } from '@/src/application/use-cases/cost/update-cost.use-case'
import { Cost } from '@/src/domain/entities/cost'
import { NotFoundError, StorageError, ValidationError } from '@/src/lib/errors'
import { InMemoryCostRepository } from '@/tests/fakes/InMemoryCostRepository'

describe('Cost use cases', () => {
  let repo: InMemoryCostRepository

  beforeEach(() => {
    repo = new InMemoryCostRepository()
  })

  describe('CreateCost', () => {
    it('creates a cost with valid input', async () => {
      const uc = new CreateCost(repo)
      const cost = await uc.execute({ amount: 50, category: 'fuel' })
      expect(cost.id).toBeTruthy()
      expect(cost.amount).toBe(50)
      expect(cost.category).toBe('fuel')
      expect(cost.date).toBeInstanceOf(Date)
    })

    it('creates a cost with an explicit date', async () => {
      const uc = new CreateCost(repo)
      const date = new Date(2024, 5, 1)
      const cost = await uc.execute({ amount: 20, category: 'food', date })
      expect(cost.date).toEqual(date)
    })

    it('throws ValidationError when amount is zero', async () => {
      const uc = new CreateCost(repo)
      await expect(
        uc.execute({ amount: 0, category: 'fuel' })
      ).rejects.toBeInstanceOf(ValidationError)
    })

    it('throws ValidationError when amount is negative', async () => {
      const uc = new CreateCost(repo)
      await expect(
        uc.execute({ amount: -10, category: 'fuel' })
      ).rejects.toBeInstanceOf(ValidationError)
    })

    it('throws ValidationError when category is empty', async () => {
      const uc = new CreateCost(repo)
      await expect(
        uc.execute({ amount: 10, category: '' })
      ).rejects.toBeInstanceOf(ValidationError)
    })
  })

  describe('UpdateCost', () => {
    it('updates amount on an existing cost', async () => {
      const createUc = new CreateCost(repo)
      const cost = await createUc.execute({
        amount: 30,
        category: 'maintenance',
      })
      const updateUc = new UpdateCost(repo)
      const updated = await updateUc.execute(cost.id, { amount: 60 })
      expect(updated.amount).toBe(60)
    })

    it('throws NotFoundError when cost does not exist', async () => {
      const uc = new UpdateCost(repo)
      await expect(uc.execute('ghost', { amount: 10 })).rejects.toBeInstanceOf(
        NotFoundError
      )
    })

    it('throws ValidationError when new amount is not positive', async () => {
      const createUc = new CreateCost(repo)
      const cost = await createUc.execute({ amount: 30, category: 'fuel' })
      const uc = new UpdateCost(repo)
      await expect(uc.execute(cost.id, { amount: -5 })).rejects.toBeInstanceOf(
        ValidationError
      )
    })
  })

  describe('GetCostsByFilter', () => {
    it('filters costs by date range', async () => {
      const createUc = new CreateCost(repo)
      await createUc.execute({
        amount: 10,
        category: 'fuel',
        date: new Date(2024, 0, 5),
      })
      await createUc.execute({
        amount: 20,
        category: 'food',
        date: new Date(2024, 2, 5),
      })

      const filterUc = new GetCostsByFilter(repo)
      const results = await filterUc.execute({
        dateRange: { from: new Date(2024, 0, 1), to: new Date(2024, 0, 31) },
      })
      expect(results).toHaveLength(1)
      expect(results[0].amount).toBe(10)
    })

    it('returns all costs when no filter is provided', async () => {
      const createUc = new CreateCost(repo)
      await createUc.execute({ amount: 10, category: 'fuel' })
      await createUc.execute({ amount: 20, category: 'food' })
      const filterUc = new GetCostsByFilter(repo)
      const results = await filterUc.execute({})
      expect(results).toHaveLength(2)
    })

    it('throws ValidationError when from > to', async () => {
      const uc = new GetCostsByFilter(repo)
      await expect(
        uc.execute({
          dateRange: { from: new Date(2024, 1, 1), to: new Date(2024, 0, 1) },
        })
      ).rejects.toBeInstanceOf(ValidationError)
    })

    it('filters by category', async () => {
      const createUc = new CreateCost(repo)
      await createUc.execute({ amount: 10, category: 'fuel' })
      await createUc.execute({ amount: 20, category: 'food' })
      const filterUc = new GetCostsByFilter(repo)
      const results = await filterUc.execute({ category: 'fuel' })
      expect(results).toHaveLength(1)
      expect(results[0].category).toBe('fuel')
    })
  })

  describe('DeleteCost', () => {
    it('deletes an existing cost', async () => {
      const createUc = new CreateCost(repo)
      const cost = await createUc.execute({
        amount: 50,
        category: 'parking_tolls',
      })
      const deleteUc = new DeleteCost(repo)
      await expect(deleteUc.execute(cost.id)).resolves.toBeUndefined()
    })

    it('throws NotFoundError when cost does not exist', async () => {
      const uc = new DeleteCost(repo)
      await expect(uc.execute('ghost')).rejects.toBeInstanceOf(NotFoundError)
    })
  })
})

describe('Cost entity', () => {
  it('reconstitute creates from stored props', () => {
    const cost = Cost.reconstitute({
      id: '1',
      date: new Date(),
      amount: 50,
      category: 'fuel',
    })
    expect(cost.amount).toBe(50)
    expect(cost.isKnownCategory).toBe(true)
  })

  it('isKnownCategory is false for custom string', () => {
    const cost = Cost.reconstitute({
      id: '1',
      date: new Date(),
      amount: 50,
      category: 'misc',
    })
    expect(cost.isKnownCategory).toBe(false)
  })

  it('update merges fields correctly', () => {
    const cost = Cost.reconstitute({
      id: '1',
      date: new Date(),
      amount: 50,
      category: 'fuel',
    })
    const updated = cost.update({ amount: 100 })
    expect(updated.amount).toBe(100)
    expect(updated.category).toBe('fuel')
  })

  it('update applies provided category', () => {
    const cost = Cost.reconstitute({
      id: '1',
      date: new Date(),
      amount: 50,
      category: 'fuel',
    })
    const updated = cost.update({ category: 'food' })
    expect(updated.category).toBe('food')
    expect(updated.amount).toBe(50)
  })

  it('update throws ValidationError when amount is not positive', () => {
    const cost = Cost.reconstitute({
      id: '1',
      date: new Date(),
      amount: 50,
      category: 'fuel',
    })
    expect(() => cost.update({ amount: 0 })).toThrow(ValidationError)
  })
})

describe('InMemoryCostRepository', () => {
  let repo: InMemoryCostRepository

  beforeEach(() => {
    repo = new InMemoryCostRepository()
  })

  it('findAll returns all stored costs', async () => {
    const cost = Cost.reconstitute({
      id: '1',
      date: new Date(),
      amount: 10,
      category: 'fuel',
    })
    await repo.create(cost)
    expect(await repo.findAll()).toHaveLength(1)
  })

  it('findById throws NotFoundError for missing id', async () => {
    await expect(repo.findById('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('update persists changes', async () => {
    const cost = Cost.reconstitute({
      id: '1',
      date: new Date(),
      amount: 10,
      category: 'fuel',
    })
    await repo.create(cost)
    const updated = Cost.reconstitute({
      id: '1',
      date: new Date(),
      amount: 99,
      category: 'food',
    })
    await repo.update(updated)
    const found = await repo.findById('1')
    expect(found.amount).toBe(99)
  })

  it('delete removes the cost', async () => {
    const cost = Cost.reconstitute({
      id: '1',
      date: new Date(),
      amount: 10,
      category: 'fuel',
    })
    await repo.create(cost)
    await repo.delete('1')
    await expect(repo.findById('1')).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('Error classes', () => {
  it('NotFoundError stores entityName and entityId', () => {
    const err = new NotFoundError('Trip', 'abc-123')
    expect(err.entityName).toBe('Trip')
    expect(err.entityId).toBe('abc-123')
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toContain('abc-123')
  })

  it('StorageError stores cause', () => {
    const cause = new Error('db fail')
    const err = new StorageError('Failed to write', cause)
    expect(err.cause).toBe(cause)
    expect(err.code).toBe('STORAGE_ERROR')
    expect(err.message).toBe('Failed to write')
  })

  it('StorageError without cause has undefined cause', () => {
    const err = new StorageError('Failed')
    expect(err.cause).toBeUndefined()
  })
})
