import { UpdateTripPlatform } from '@/src/application/use-cases/trip-platform/update-trip-platform.use-case'

describe('UpdateTripPlatform coverage', () => {
  it('updates description and tags when provided', async () => {
    const existing = { id: 'tp1', name: 'X', description: 'old', tags: ['a'] }
    const repo: any = {
      findById: async () => existing,
      update: async (t: any) => t,
    }

    const uc = new UpdateTripPlatform(repo)
    const res = await uc.execute('tp1', { description: 'new-desc', tags: ['b'] })
    expect(res.description).toBe('new-desc')
    expect(res.tags).toEqual(['b'])
  })

  it('keeps properties when undefined', async () => {
    const existing = { id: 'tp2', name: 'Y', description: 'old', tags: ['a'] }
    const repo: any = {
      findById: async () => existing,
      update: async (t: any) => t,
    }

    const uc = new UpdateTripPlatform(repo)
    const res = await uc.execute('tp2', { name: 'Z' })
    expect(res.name).toBe('Z')
    expect(res.description).toBe('old')
  })
})
