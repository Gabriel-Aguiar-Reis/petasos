import { RecurrenceService } from '@/src/application/services/recurrence.service'
import { CreateCost } from '@/src/application/use-cases/cost/create-cost.use-case'
import { DeleteCost } from '@/src/application/use-cases/cost/delete-cost.use-case'
import { GetCostsByFilter } from '@/src/application/use-cases/cost/get-cost-by-filter.use-case'
import { GetCostsByDateRange } from '@/src/application/use-cases/cost/get-costs-by-date-range.use-case'
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

describe('Cost recurrence', () => {
  let repo: InMemoryCostRepository
  let createUc: CreateCost
  let updateUc: UpdateCost
  let recurrenceService: RecurrenceService
  let getRangeUc: GetCostsByDateRange

  beforeEach(() => {
    repo = new InMemoryCostRepository()
    createUc = new CreateCost(repo)
    updateUc = new UpdateCost(repo)
    recurrenceService = new RecurrenceService()
    getRangeUc = new GetCostsByDateRange(repo, recurrenceService)
  })

  it('creates a cost with recurrence rule', async () => {
    const cost = await createUc.execute({
      amount: 100,
      category: 'maintenance',
      date: new Date('2025-01-01'),
      recurrence: { rule: 'FREQ=MONTHLY;COUNT=3' },
    })
    expect(cost.recurrence?.rule).toBe('FREQ=MONTHLY;COUNT=3')
  })

  it('updates a cost adding recurrence', async () => {
    const cost = await createUc.execute({
      amount: 50,
      category: 'fuel',
      date: new Date('2025-01-01'),
    })
    const updated = await updateUc.execute(cost.id, {
      recurrence: { rule: 'FREQ=WEEKLY;COUNT=4' },
    })
    expect(updated.recurrence?.rule).toBe('FREQ=WEEKLY;COUNT=4')
  })

  it('GetCostsByDateRange returns one-time and recurring costs', async () => {
    // One-time cost in range
    await createUc.execute({
      amount: 30,
      category: 'parking_tolls',
      date: new Date('2025-03-15'),
    })
    // Recurring cost starting before range — generates monthly occurrences
    await createUc.execute({
      amount: 200,
      category: 'maintenance',
      date: new Date('2025-01-10'),
      recurrence: { rule: 'FREQ=MONTHLY;COUNT=12' },
    })
    const results = await getRangeUc.execute(
      new Date('2025-03-01'),
      new Date('2025-04-30')
    )
    // Should include the one-time cost (Mar 15) + monthly occurrences in range (Mar 10, Apr 10)
    expect(results.length).toBeGreaterThanOrEqual(2)
    const amounts = results.map((c) => c.amount)
    expect(amounts).toContain(30)
    expect(amounts).toContain(200)
  })

  it('exception date is excluded from recurring occurrences', async () => {
    const exceptionDate = new Date('2025-03-01T00:00:00.000Z')
    await createUc.execute({
      amount: 100,
      category: 'fuel',
      date: new Date('2025-01-01T00:00:00.000Z'),
      recurrence: {
        rule: 'FREQ=MONTHLY;COUNT=6',
        exceptions: [exceptionDate],
      },
    })
    const results = await getRangeUc.execute(
      new Date('2025-02-28T00:00:00.000Z'),
      new Date('2025-03-31T23:59:59.000Z')
    )
    // The March occurrence should be excluded by exdate
    const marchOccurrences = results.filter(
      (c) =>
        c.amount === 100 &&
        c.date >= new Date('2025-03-01') &&
        c.date <= new Date('2025-03-31')
    )
    expect(marchOccurrences.length).toBe(0)
  })
})
