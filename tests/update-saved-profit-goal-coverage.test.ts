import { UpdateSavedProfitGoal } from '@/src/application/use-cases/saved-profit-goal/update-saved-profit-goal.use-case'
import { NotFoundError } from '@/src/lib/errors'

describe('UpdateSavedProfitGoal coverage', () => {
  it('rounds targetAmount and clears period/tags/notes when null', async () => {
    const existing = {
      id: 's1',
      name: 'save',
      targetAmount: 50,
      period: 'daily',
      tags: ['a'],
      notes: 'x',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }

    const repo: any = {
      findById: async () => existing,
      update: async (u: any) => u,
    }

    const uc = new UpdateSavedProfitGoal(repo)
    const res = await uc.execute('s1', { targetAmount: 77.777, period: null, tags: null, notes: null })
    expect(res.targetAmount).toBe(77.78)
    expect(res.period).toBeUndefined()
    expect(res.tags).toBeUndefined()
    expect(res.notes).toBeUndefined()
  })

  it('throws NotFoundError when missing', async () => {
    const repo: any = { findById: async () => null }
    const uc = new UpdateSavedProfitGoal(repo)
    await expect(uc.execute('bad', {} as any)).rejects.toThrow(NotFoundError)
  })
})
