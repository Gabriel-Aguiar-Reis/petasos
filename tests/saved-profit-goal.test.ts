import { CreatePlatformProfitGoal } from '@/src/application/use-cases/platform-profit-goal/create-platform-profit-goal.use-case'
import { DeletePlatformProfitGoal } from '@/src/application/use-cases/platform-profit-goal/delete-platform-profit-goal.use-case'
import { UpdatePlatformProfitGoal } from '@/src/application/use-cases/platform-profit-goal/update-platform-profit-goal.use-case'
import { CreateSavedProfitGoal } from '@/src/application/use-cases/saved-profit-goal/create-saved-profit-goal.use-case'
import { DeleteSavedProfitGoal } from '@/src/application/use-cases/saved-profit-goal/delete-saved-profit-goal.use-case'
import { UpdateSavedProfitGoal } from '@/src/application/use-cases/saved-profit-goal/update-saved-profit-goal.use-case'
import { ValidationError } from '@/src/lib/errors'
import { InMemoryPlatformProfitGoalRepository } from './fakes/InMemoryPlatformProfitGoalRepository'
import { InMemorySavedProfitGoalRepository } from './fakes/InMemorySavedProfitGoalRepository'

describe('SavedProfitGoal', () => {
  let repo: InMemorySavedProfitGoalRepository
  let createUc: CreateSavedProfitGoal
  let updateUc: UpdateSavedProfitGoal
  let deleteUc: DeleteSavedProfitGoal

  beforeEach(() => {
    repo = new InMemorySavedProfitGoalRepository()
    createUc = new CreateSavedProfitGoal(repo)
    updateUc = new UpdateSavedProfitGoal(repo)
    deleteUc = new DeleteSavedProfitGoal(repo)
  })

  describe('CreateSavedProfitGoal', () => {
    it('creates a goal with valid input', async () => {
      const goal = await createUc.execute({
        name: 'Daily target',
        targetAmount: 200,
        period: 'daily',
      })
      expect(goal.id).toBeTruthy()
      expect(goal.name).toBe('Daily target')
      expect(goal.targetAmount).toBe(200)
      expect(goal.period).toBe('daily')
      expect(goal.createdAt).toBeInstanceOf(Date)
      expect(goal.updatedAt).toBeInstanceOf(Date)
    })

    it('throws ValidationError when name is empty', async () => {
      await expect(
        createUc.execute({ name: '', targetAmount: 100 })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when targetAmount is 0', async () => {
      await expect(
        createUc.execute({ name: 'Goal', targetAmount: 0 })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when targetAmount is negative', async () => {
      await expect(
        createUc.execute({ name: 'Goal', targetAmount: -50 })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('UpdateSavedProfitGoal', () => {
    it('updates targetAmount', async () => {
      const created = await createUc.execute({
        name: 'Goal',
        targetAmount: 100,
      })
      const updated = await updateUc.execute(created.id, { targetAmount: 300 })
      expect(updated.targetAmount).toBe(300)
    })

    it('updates name and period', async () => {
      const created = await createUc.execute({
        name: 'Old',
        targetAmount: 100,
      })
      const updated = await updateUc.execute(created.id, {
        name: 'New',
        period: 'weekly',
      })
      expect(updated.name).toBe('New')
      expect(updated.period).toBe('weekly')
    })
  })

  describe('DeleteSavedProfitGoal', () => {
    it('removes goal from store', async () => {
      const created = await createUc.execute({
        name: 'Goal',
        targetAmount: 100,
      })
      await deleteUc.execute(created.id)
      expect(await repo.findById(created.id)).toBeNull()
    })
  })
})

describe('PlatformProfitGoal', () => {
  let repo: InMemoryPlatformProfitGoalRepository
  let createUc: CreatePlatformProfitGoal
  let updateUc: UpdatePlatformProfitGoal
  let deleteUc: DeletePlatformProfitGoal

  beforeEach(() => {
    repo = new InMemoryPlatformProfitGoalRepository()
    createUc = new CreatePlatformProfitGoal(repo)
    updateUc = new UpdatePlatformProfitGoal(repo)
    deleteUc = new DeletePlatformProfitGoal(repo)
  })

  describe('CreatePlatformProfitGoal', () => {
    it('creates a goal with valid input', async () => {
      const goal = await createUc.execute({
        platformId: 'uber-id',
        targetAmount: 500,
      })
      expect(goal.id).toBeTruthy()
      expect(goal.platformId).toBe('uber-id')
      expect(goal.targetAmount).toBe(500)
    })

    it('throws ValidationError when targetAmount is 0', async () => {
      await expect(
        createUc.execute({ platformId: 'uber-id', targetAmount: 0 })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when platformId is empty', async () => {
      await expect(
        createUc.execute({ platformId: '', targetAmount: 100 })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('UpdatePlatformProfitGoal', () => {
    it('updates targetAmount', async () => {
      const created = await createUc.execute({
        platformId: 'uber-id',
        targetAmount: 500,
      })
      const updated = await updateUc.execute(created.id, { targetAmount: 800 })
      expect(updated.targetAmount).toBe(800)
    })
  })

  describe('DeletePlatformProfitGoal', () => {
    it('removes goal from store', async () => {
      const created = await createUc.execute({
        platformId: 'uber-id',
        targetAmount: 500,
      })
      await deleteUc.execute(created.id)
      expect(await repo.findById(created.id)).toBeNull()
    })
  })
})
