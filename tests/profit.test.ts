import { CreateProfit } from '@/src/application/use-cases/profit/create-profit.use-case'
import { DeleteProfit } from '@/src/application/use-cases/profit/delete-profit.use-case'
import { UpdateProfit } from '@/src/application/use-cases/profit/update-profit.use-case'
import { ValidationError } from '@/src/lib/errors'
import { InMemoryProfitRepository } from './fakes/InMemoryProfitRepository'

describe('Profit', () => {
  let repo: InMemoryProfitRepository
  let createUc: CreateProfit
  let updateUc: UpdateProfit
  let deleteUc: DeleteProfit

  beforeEach(() => {
    repo = new InMemoryProfitRepository()
    createUc = new CreateProfit(repo)
    updateUc = new UpdateProfit(repo)
    deleteUc = new DeleteProfit(repo)
  })

  describe('CreateProfit', () => {
    it('creates a profit with valid input', async () => {
      const profit = await createUc.execute({
        amount: 150.5,
        platformId: 'uber-id',
        date: new Date('2025-06-01'),
        description: 'Weekly earnings',
      })
      expect(profit.id).toBeTruthy()
      expect(profit.amount).toBe(150.5)
      expect(profit.platformId).toBe('uber-id')
      expect(profit.description).toBe('Weekly earnings')
    })

    it('throws ValidationError when amount is 0', async () => {
      await expect(
        createUc.execute({ amount: 0, platformId: 'uber-id' })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when amount is negative', async () => {
      await expect(
        createUc.execute({ amount: -10, platformId: 'uber-id' })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when platformId is empty', async () => {
      await expect(
        createUc.execute({ amount: 50, platformId: '' })
      ).rejects.toThrow(ValidationError)
    })

    it('rounds amount to 2 decimal places', async () => {
      const profit = await createUc.execute({
        amount: 99.999,
        platformId: 'uber-id',
      })
      expect(profit.amount).toBe(100)
    })
  })

  describe('UpdateProfit', () => {
    it('updates amount on existing profit', async () => {
      const created = await createUc.execute({
        amount: 100,
        platformId: 'uber-id',
      })
      const updated = await updateUc.execute(created.id, { amount: 200 })
      expect(updated.amount).toBe(200)
    })

    it('updates description', async () => {
      const created = await createUc.execute({
        amount: 100,
        platformId: 'uber-id',
      })
      const updated = await updateUc.execute(created.id, {
        description: 'Updated desc',
      })
      expect(updated.description).toBe('Updated desc')
    })
  })

  describe('DeleteProfit', () => {
    it('removes profit from store', async () => {
      const created = await createUc.execute({
        amount: 100,
        platformId: 'uber-id',
      })
      await deleteUc.execute(created.id)
      expect(await repo.findById(created.id)).toBeNull()
    })
  })
})
