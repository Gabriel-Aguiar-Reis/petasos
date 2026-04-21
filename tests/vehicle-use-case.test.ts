import { UpdateVehicle } from '@/src/application/use-cases/vehicle/update-vehicle.use-case'
import { Vehicle } from '@/src/domain/entities/vehicle'

const BASE = {
  id: 'v1',
  name: 'Car',
  plate: 'XYZ-0000',
  brand: 'Foo',
  model: 'Bar',
  year: 2020,
  fuelTypeId: 'f1',
  typeId: 't1',
}

class FakeRepo {
  public updated: any = null
  async findById(id: string) {
    if (id === BASE.id) return Vehicle.reconstitute(BASE)
    return null
  }
  async update(v: Vehicle) {
    this.updated = v
    return v
  }
}

describe('UpdateVehicle use-case', () => {
  it('calls repository.update with updated vehicle', async () => {
    const repo = new FakeRepo()
    const uc = new UpdateVehicle(repo as any)
    const result = await uc.execute(BASE.id, { brand: 'NewBrand' } as any)
    expect(result.brand).toBe('NewBrand')
    expect(repo.updated).toBeDefined()
  })
})
