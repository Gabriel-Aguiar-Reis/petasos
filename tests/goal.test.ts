import { CreateGoal } from '@/src/application/use-cases/goal/create-goal.use-case'
import { DeleteGoal } from '@/src/application/use-cases/goal/delete-goal.use-case'
import { GetGoalProgress } from '@/src/application/use-cases/goal/get-goal-progress.use-case'
import { CreateTrip } from '@/src/application/use-cases/trip/create-trip.use-case'
import { Goal } from '@/src/domain/entities/goal'
import { NotFoundError, ValidationError } from '@/src/lib/errors'
import { InMemoryGoalRepository } from '@/tests/fakes/InMemoryGoalRepository'
import { InMemoryTripRepository } from '@/tests/fakes/InMemoryTripRepository'

describe('Goal use cases', () => {
  let goalRepo: InMemoryGoalRepository
  let tripRepo: InMemoryTripRepository

  beforeEach(() => {
    goalRepo = new InMemoryGoalRepository()
    tripRepo = new InMemoryTripRepository()
  })

  describe('CreateGoal', () => {
    it('creates a goal with valid input', async () => {
      const uc = new CreateGoal(goalRepo)
      const goal = await uc.execute({
        type: 'daily',
        targetAmount: 100,
        periodStart: new Date(2024, 0, 1),
      })
      expect(goal.id).toBeTruthy()
      expect(goal.targetAmount).toBe(100)
    })

    it('defaults periodStart to today when omitted', async () => {
      const uc = new CreateGoal(goalRepo)
      const before = new Date()
      const goal = await uc.execute({ type: 'weekly', targetAmount: 500 })
      const after = new Date()
      expect(goal.periodStart.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(goal.periodStart.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('throws ValidationError when targetAmount is zero', async () => {
      const uc = new CreateGoal(goalRepo)
      await expect(
        uc.execute({ type: 'daily', targetAmount: 0, periodStart: new Date() })
      ).rejects.toBeInstanceOf(ValidationError)
    })

    it('throws ValidationError when targetAmount is negative', async () => {
      const uc = new CreateGoal(goalRepo)
      await expect(
        uc.execute({ type: 'daily', targetAmount: -10, periodStart: new Date() })
      ).rejects.toBeInstanceOf(ValidationError)
    })
  })

  describe('GetGoalProgress', () => {
    it('returns progress for a daily goal', async () => {
      const periodStart = new Date(2024, 0, 15, 0, 0, 0)
      await new CreateGoal(goalRepo).execute({
        type: 'daily',
        targetAmount: 100,
        periodStart,
      })
      await new CreateTrip(tripRepo).execute({
        earnings: 80,
        platform: 'Uber',
        date: new Date(2024, 0, 15, 10, 0, 0),
      })

      const results = await new GetGoalProgress(goalRepo, tripRepo).execute()
      expect(results).toHaveLength(1)
      expect(results[0].actualEarnings).toBe(80)
      expect(results[0].achieved).toBe(false)
      expect(results[0].remainingAmount).toBe(20)
    })

    it('marks goal as achieved when earnings meet the target', async () => {
      const periodStart = new Date(2024, 0, 15, 0, 0, 0)
      await new CreateGoal(goalRepo).execute({
        type: 'daily',
        targetAmount: 50,
        periodStart,
      })
      await new CreateTrip(tripRepo).execute({
        earnings: 80,
        platform: 'Uber',
        date: new Date(2024, 0, 15, 10, 0, 0),
      })

      const results = await new GetGoalProgress(goalRepo, tripRepo).execute()
      expect(results[0].achieved).toBe(true)
      expect(results[0].remainingAmount).toBe(0)
    })

    it('returns empty list when no goals exist', async () => {
      const results = await new GetGoalProgress(goalRepo, tripRepo).execute()
      expect(results).toHaveLength(0)
    })
  })

  describe('DeleteGoal', () => {
    it('deletes an existing goal', async () => {
      const goal = await new CreateGoal(goalRepo).execute({
        type: 'monthly',
        targetAmount: 3000,
        periodStart: new Date(2024, 0, 1),
      })
      await expect(
        new DeleteGoal(goalRepo).execute(goal.id)
      ).resolves.toBeUndefined()
    })

    it('throws NotFoundError when goal does not exist', async () => {
      await expect(
        new DeleteGoal(goalRepo).execute('ghost')
      ).rejects.toBeInstanceOf(NotFoundError)
    })
  })
})

describe('Goal entity', () => {
  it('periodEnd for daily goal is end of same day', () => {
    const periodStart = new Date(2024, 0, 15, 12, 0, 0)
    const goal = Goal.reconstitute({
      id: '1',
      type: 'daily',
      targetAmount: 100,
      periodStart,
    })
    const end = goal.periodEnd
    expect(end.getFullYear()).toBe(2024)
    expect(end.getMonth()).toBe(0)
    expect(end.getDate()).toBe(15)
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
  })

  it('periodEnd for weekly goal is 6 days later at end of day', () => {
    const periodStart = new Date(2024, 0, 15, 0, 0, 0)
    const goal = Goal.reconstitute({
      id: '1',
      type: 'weekly',
      targetAmount: 500,
      periodStart,
    })
    const end = goal.periodEnd
    expect(end.getDate()).toBe(21) // 15 + 6
    expect(end.getHours()).toBe(23)
    expect(end.getSeconds()).toBe(59)
  })

  it('periodEnd for monthly goal is the last day of the month', () => {
    const periodStart = new Date(2024, 0, 1) // January 2024
    const goal = Goal.reconstitute({
      id: '1',
      type: 'monthly',
      targetAmount: 3000,
      periodStart,
    })
    const end = goal.periodEnd
    expect(end.getMonth()).toBe(0) // still January
    expect(end.getDate()).toBe(31) // last day of January
    expect(end.getHours()).toBe(23)
  })

  it('isAchieved returns true when earnings >= targetAmount', () => {
    const goal = Goal.reconstitute({
      id: '1',
      type: 'daily',
      targetAmount: 100,
      periodStart: new Date(),
    })
    expect(goal.isAchieved(100)).toBe(true)
    expect(goal.isAchieved(150)).toBe(true)
    expect(goal.isAchieved(99)).toBe(false)
  })

  it('remainingAmount returns 0 when achieved, positive otherwise', () => {
    const goal = Goal.reconstitute({
      id: '1',
      type: 'daily',
      targetAmount: 100,
      periodStart: new Date(),
    })
    expect(goal.remainingAmount(150)).toBe(0)
    expect(goal.remainingAmount(80)).toBe(20)
  })

  it('contains returns true for dates in range and false outside', () => {
    const periodStart = new Date(2024, 0, 15, 0, 0, 0)
    const goal = Goal.reconstitute({
      id: '1',
      type: 'daily',
      targetAmount: 100,
      periodStart,
    })
    expect(goal.contains(new Date(2024, 0, 15, 10, 0, 0))).toBe(true)
    expect(goal.contains(new Date(2024, 0, 14, 23, 59, 59))).toBe(false)
  })
})

describe('InMemoryGoalRepository', () => {
  let repo: InMemoryGoalRepository

  beforeEach(() => {
    repo = new InMemoryGoalRepository()
  })

  it('findAll returns all stored goals', async () => {
    const goal = Goal.reconstitute({
      id: '1',
      type: 'daily',
      targetAmount: 100,
      periodStart: new Date(),
    })
    await repo.create(goal)
    expect(await repo.findAll()).toHaveLength(1)
  })

  it('findById throws NotFoundError for missing id', async () => {
    await expect(repo.findById('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('findByType filters goals by type', async () => {
    const g1 = Goal.reconstitute({
      id: '1',
      type: 'daily',
      targetAmount: 100,
      periodStart: new Date(),
    })
    const g2 = Goal.reconstitute({
      id: '2',
      type: 'weekly',
      targetAmount: 500,
      periodStart: new Date(),
    })
    await repo.create(g1)
    await repo.create(g2)
    const results = await repo.findByType('weekly')
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe('weekly')
  })

  it('update persists changes', async () => {
    const goal = Goal.reconstitute({
      id: '1',
      type: 'daily',
      targetAmount: 100,
      periodStart: new Date(),
    })
    await repo.create(goal)
    const updated = Goal.reconstitute({
      id: '1',
      type: 'daily',
      targetAmount: 200,
      periodStart: new Date(),
    })
    await repo.update(updated)
    const found = await repo.findById('1')
    expect(found.targetAmount).toBe(200)
  })

  it('delete removes the goal', async () => {
    const goal = Goal.reconstitute({
      id: '1',
      type: 'daily',
      targetAmount: 100,
      periodStart: new Date(),
    })
    await repo.create(goal)
    await repo.delete('1')
    await expect(repo.findById('1')).rejects.toBeInstanceOf(NotFoundError)
  })
})
