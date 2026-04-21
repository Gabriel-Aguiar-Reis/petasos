import { UpdateVehicleType } from '@/src/application/use-cases/vehicle-type/update-vehicle-type.use-case'

describe('UpdateVehicleType coverage', () => {
  it('updates description and tags when provided', async () => {
    const existing = { id: 'vt1', name: 'X', description: 'old', tags: ['a'] }
    const repo: any = { findById: async () => existing, update: async (t: any) => t }

    const uc = new UpdateVehicleType(repo)
    const res = await uc.execute('vt1', { description: 'new-desc', tags: ['b'] })
    expect(res.description).toBe('new-desc')
    expect(res.tags).toEqual(['b'])
  })

  it('keeps properties when undefined', async () => {
    const existing = { id: 'vt2', name: 'Y', description: 'old', tags: ['a'] }
    const repo: any = { findById: async () => existing, update: async (t: any) => t }

    const uc = new UpdateVehicleType(repo)
    const res = await uc.execute('vt2', { name: 'Z' })
    expect(res.name).toBe('Z')
    expect(res.description).toBe('old')
  })
})
