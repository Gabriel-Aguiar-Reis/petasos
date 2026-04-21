import { CreateFuelType } from '@/src/application/use-cases/fuel-type/create-fuel-type.use-case'
import { GetAllFuelTypes } from '@/src/application/use-cases/fuel-type/get-all-fuel-types.use-case'
import { UpdateFuelType } from '@/src/application/use-cases/fuel-type/update-fuel-type.use-case'
import { DeleteFuelType } from '@/src/application/use-cases/fuel-type/delete-fuel-type.use-case'
import type { FuelType } from '@/src/domain/entities/fuel-type'

class FakeFuelTypeRepo {
  private data = new Map<string, FuelType>()

  async create(ft: FuelType) {
    this.data.set(ft.id, ft)
    return ft
  }

  async findById(id: string) {
    return this.data.get(id) ?? null
  }

  async findAll() {
    return Array.from(this.data.values())
  }

  async update(ft: FuelType) {
    this.data.set(ft.id, ft)
    return ft
  }

  async delete(id: string) {
    this.data.delete(id)
  }
}

describe('FuelType use-cases', () => {
  it('create -> returns created fuel type', async () => {
    const repo = new FakeFuelTypeRepo()
    const uc = new CreateFuelType(repo as any)
    const input = { name: 'Gasolina', description: 'Comum', tags: ['A'] }
    const created = await uc.execute(input as any)
    expect(created.name).toBe('Gasolina')
    expect(created.id).toBeDefined()
  })

  it('getAll -> returns all items', async () => {
    const repo = new FakeFuelTypeRepo()
    const create = new CreateFuelType(repo as any)
    await create.execute({ name: 'Etanol' } as any)
    const uc = new GetAllFuelTypes(repo as any)
    const all = await uc.execute()
    expect(all.length).toBeGreaterThanOrEqual(1)
  })

  it('update -> merges only provided fields', async () => {
    const repo = new FakeFuelTypeRepo()
    const create = new CreateFuelType(repo as any)
    const created = await create.execute({ name: 'Diesel' } as any)

    const uc = new UpdateFuelType(repo as any)
    const updated = await uc.execute(created.id, { name: 'Diesel S10' } as any)
    expect(updated.name).toBe('Diesel S10')
  })

  it('delete -> removes item', async () => {
    const repo = new FakeFuelTypeRepo()
    const create = new CreateFuelType(repo as any)
    const created = await create.execute({ name: 'GNV' } as any)
    const uc = new DeleteFuelType(repo as any)
    await uc.execute(created.id)
    const found = await repo.findById(created.id)
    expect(found).toBeNull()
  })
})
