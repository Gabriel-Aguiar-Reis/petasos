import { CreateVehicleType } from '@/src/application/use-cases/vehicle-type/create-vehicle-type.use-case'
import { DeleteVehicleType } from '@/src/application/use-cases/vehicle-type/delete-vehicle-type.use-case'
import { GetAllVehicleTypes } from '@/src/application/use-cases/vehicle-type/get-all-vehicle-types.use-case'
import { UpdateVehicleType } from '@/src/application/use-cases/vehicle-type/update-vehicle-type.use-case'
import type { VehicleType } from '@/src/domain/entities/vehicle-type'

class FakeRepo {
  private data = new Map<string, VehicleType>()
  async create(v: VehicleType) {
    this.data.set(v.id, v)
    return v
  }
  async findById(id: string) {
    return this.data.get(id) ?? null
  }
  async findAll() {
    return Array.from(this.data.values())
  }
  async update(v: VehicleType) {
    this.data.set(v.id, v)
    return v
  }
  async delete(id: string) {
    this.data.delete(id)
  }
}

describe('VehicleType use-cases', () => {
  it('CRUD flow', async () => {
    const repo = new FakeRepo()
    const create = new CreateVehicleType(repo as any)
    const item = await create.execute({ name: 'Sedan' } as any)
    expect(item.name).toBe('Sedan')

    const getAll = new GetAllVehicleTypes(repo as any)
    const list = await getAll.execute()
    expect(list.length).toBeGreaterThanOrEqual(1)

    const update = new UpdateVehicleType(repo as any)
    const updated = await update.execute(item.id, {
      description: '4 doors',
    } as any)
    expect(updated.description).toBe('4 doors')

    const del = new DeleteVehicleType(repo as any)
    await del.execute(item.id)
    const found = await repo.findById(item.id)
    expect(found).toBeNull()
  })
})
