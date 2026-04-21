import { UpdatePlatformProfitGoal } from '@/src/application/use-cases/platform-profit-goal/update-platform-profit-goal.use-case'
import { NotFoundError, ValidationError } from '@/src/lib/errors'

describe('UpdatePlatformProfitGoal coverage', () => {
  it('updates targetAmount (rounded) and converts null tags/notes to undefined', async () => {
    const existing = {
      id: 'p1',
      platformId: 'pf1',
      targetAmount: 100,
      tags: ['a'],
      notes: 'n',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }

    const repo: any = {
      findById: async () => existing,
      update: async (u: any) => u,
    }

    const uc = new UpdatePlatformProfitGoal(repo)
    const res = await uc.execute('p1', { targetAmount: 123.456, tags: null, notes: null })
    expect(res.targetAmount).toBe(123.46)
    expect(res.tags).toBeUndefined()
    expect(res.notes).toBeUndefined()
  })

  it('throws NotFoundError when missing', async () => {
    const repo: any = { findById: async () => null }
    const uc = new UpdatePlatformProfitGoal(repo)
    await expect(uc.execute('bad', {} as any)).rejects.toThrow(NotFoundError)
  })

  it('keeps existing fields when input omits them', async () => {
    const existing = {
      id: 'p2',
      platformId: 'pf2',
      targetAmount: 50,
      tags: ['x'],
      notes: 'note',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }

    const repo: any = { findById: async () => existing, update: async (u: any) => u }
    const uc = new UpdatePlatformProfitGoal(repo)
    const res = await uc.execute('p2', {})
    expect(res.targetAmount).toBe(50)
    expect(res.tags).toEqual(['x'])
    expect(res.notes).toBe('note')
  })
})
