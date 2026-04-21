import { CreateTripPlatform } from '@/src/application/use-cases/trip-platform/create-trip-platform.use-case'
import { DeleteTripPlatform } from '@/src/application/use-cases/trip-platform/delete-trip-platform.use-case'
import { GetAllTripPlatforms } from '@/src/application/use-cases/trip-platform/get-all-trip-platforms.use-case'
import { UpdateTripPlatform } from '@/src/application/use-cases/trip-platform/update-trip-platform.use-case'
import type { TripPlatform } from '@/src/domain/entities/trip-platform'

class FakeRepo {
  private data = new Map<string, TripPlatform>()

  async create(t: TripPlatform) {
    this.data.set(t.id, t)
    return t
  }

  async findById(id: string) {
    return this.data.get(id) ?? null
  }

  async findAll() {
    return Array.from(this.data.values())
  }

  async update(t: TripPlatform) {
    this.data.set(t.id, t)
    return t
  }

  async delete(id: string) {
    this.data.delete(id)
  }
}

describe('TripPlatform use-cases', () => {
  it('create/getAll/update/delete flow', async () => {
    const repo = new FakeRepo()
    const create = new CreateTripPlatform(repo as any)
    const item = await create.execute({ name: 'Uber' } as any)
    expect(item.name).toBe('Uber')

    const allUC = new GetAllTripPlatforms(repo as any)
    const list = await allUC.execute()
    expect(list.length).toBeGreaterThanOrEqual(1)

    const update = new UpdateTripPlatform(repo as any)
    const updated = await update.execute(item.id, {
      description: 'Rideshare',
    } as any)
    expect(updated.description).toBe('Rideshare')

    const del = new DeleteTripPlatform(repo as any)
    await del.execute(item.id)
    const found = await repo.findById(item.id)
    expect(found).toBeNull()
  })
})
