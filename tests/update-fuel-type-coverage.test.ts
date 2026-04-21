import { UpdateFuelType } from '@/src/application/use-cases/fuel-type/update-fuel-type.use-case'

describe('UpdateFuelType coverage', () => {
  it('applies description and tags when provided', async () => {
    const repo: any = {
      findById: async (id: string) => ({ id, name: 'gas', description: 'old', tags: ['x'] }),
      update: async (ft: any) => ft,
    }

    const uc = new UpdateFuelType(repo)
    const res = await uc.execute('ft1', { description: 'new-desc', tags: ['a', 'b'] })
    expect(res.description).toBe('new-desc')
    expect(res.tags).toEqual(['a', 'b'])
  })

  it('keeps properties when undefined', async () => {
    const repo: any = {
      findById: async (id: string) => ({ id, name: 'gas', description: 'old', tags: ['x'] }),
      update: async (ft: any) => ft,
    }

    const uc = new UpdateFuelType(repo)
    const res = await uc.execute('ft1', { name: 'gasoline' })
    expect(res.name).toBe('gasoline')
    expect(res.description).toBe('old')
  })
})
