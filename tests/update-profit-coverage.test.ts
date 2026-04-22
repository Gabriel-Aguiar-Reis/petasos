import { UpdateProfit } from '@/src/application/use-cases/profit/update-profit.use-case'
import { NotFoundError } from '@/src/lib/errors'

describe('UpdateProfit coverage', () => {
  it('clears description when set to null and accepts tags', async () => {
    const existing = {
      id: 'pr1',
      date: new Date('2025-01-01'),
      amount: 10,
      platformId: 'pf1',
      description: 'old',
      tags: ['a'],
    }

    const repo: any = {
      findById: async () => existing,
      update: async (u: any) => u,
    }

    const uc = new UpdateProfit(repo)
    const res = await uc.execute('pr1', { description: null, tags: ['x'] })
    expect(res.description).toBeUndefined()
    expect(res.tags).toEqual(['x'])
  })

  it('throws NotFoundError when missing', async () => {
    const repo: any = { findById: async () => null }
    const uc = new UpdateProfit(repo)
    await expect(uc.execute('bad', {} as any)).rejects.toThrow(NotFoundError)
  })

  it('keeps existing amount and tags when omitted', async () => {
    const existing = {
      id: 'pr2',
      date: new Date('2025-02-01'),
      amount: 77.77,
      platformId: 'pf2',
      description: 'desc',
      tags: ['t1'],
    }

    const repo: any = {
      findById: async () => existing,
      update: async (u: any) => u,
    }
    const uc = new UpdateProfit(repo)
    const res = await uc.execute('pr2', {})
    expect(res.amount).toBe(77.77)
    expect(res.tags).toEqual(['t1'])
  })

  it('converts null tags to undefined', async () => {
    const existing = {
      id: 'pr3',
      date: new Date('2025-03-01'),
      amount: 5,
      platformId: 'pf3',
      description: 'd',
      tags: ['t'],
    }

    const repo: any = {
      findById: async () => existing,
      update: async (u: any) => u,
    }
    const uc = new UpdateProfit(repo)
    const res = await uc.execute('pr3', { tags: null })
    expect(res.tags).toBeUndefined()
  })
})
