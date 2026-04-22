import {
  CreateVehicleTypeSchema,
  UpdateVehicleTypeSchema,
} from '@/src/domain/validations/vehicle-type'

describe('VehicleType validation', () => {
  it('create accepts name', () => {
    const p = CreateVehicleTypeSchema.parse({ name: 'Hatch' })
    expect(p.name).toBe('Hatch')
  })

  it('update accepts partials', () => {
    const p = UpdateVehicleTypeSchema.parse({ tags: ['a'] })
    expect(p.tags).toEqual(['a'])
  })
})
