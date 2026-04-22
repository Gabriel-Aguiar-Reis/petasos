import { Vehicle } from '@/src/domain/entities/vehicle'
import { ValidationError } from '@/src/lib/errors'

const BASE_PROPS = {
  id: '1',
  name: 'HB20 Prata',
  plate: 'ABC-1234',
  brand: 'Hyundai',
  model: 'HB20',
  year: 2021,
  fuelTypeId: 'fuel-1',
  typeId: 'type-1',
}

describe('Vehicle entity', () => {
  it('reconstitute creates a vehicle from stored props', () => {
    const vehicle = Vehicle.reconstitute(BASE_PROPS)
    expect(vehicle.id).toBe('1')
    expect(vehicle.name).toBe('HB20 Prata')
    expect(vehicle.plate).toBe('ABC-1234')
    expect(vehicle.brand).toBe('Hyundai')
    expect(vehicle.model).toBe('HB20')
    expect(vehicle.year).toBe(2021)
    expect(vehicle.fuelTypeId).toBe('fuel-1')
    expect(vehicle.typeId).toBe('type-1')
  })

  it('create validates all required fields', () => {
    const vehicle = Vehicle.create({ ...BASE_PROPS, id: '1' })
    expect(vehicle.brand).toBe('Hyundai')
  })

  it('create throws ValidationError when name is empty', () => {
    expect(() => Vehicle.create({ ...BASE_PROPS, id: '1', name: '' })).toThrow(
      ValidationError
    )
  })

  it('create throws ValidationError when brand is missing', () => {
    expect(() => Vehicle.create({ ...BASE_PROPS, id: '1', brand: '' })).toThrow(
      ValidationError
    )
  })

  it('create throws ValidationError when model is missing', () => {
    expect(() => Vehicle.create({ ...BASE_PROPS, id: '1', model: '' })).toThrow(
      ValidationError
    )
  })

  it('create throws ValidationError when year is below 1900', () => {
    expect(() => Vehicle.create({ ...BASE_PROPS, id: '1', year: 1800 })).toThrow(
      ValidationError
    )
  })

  it('create throws ValidationError when fuelTypeId is empty', () => {
    expect(() =>
      Vehicle.create({ ...BASE_PROPS, id: '1', fuelTypeId: '' })
    ).toThrow(ValidationError)
  })

  it('create throws ValidationError when typeId is empty', () => {
    expect(() => Vehicle.create({ ...BASE_PROPS, id: '1', typeId: '' })).toThrow(
      ValidationError
    )
  })

  it('displayName includes plate when present', () => {
    const vehicle = Vehicle.reconstitute(BASE_PROPS)
    expect(vehicle.displayName).toBe('HB20 Prata (ABC-1234)')
  })

  it('update returns new instance with changed fields', () => {
    const vehicle = Vehicle.reconstitute(BASE_PROPS)
    const updated = vehicle.update({ brand: 'Toyota', model: 'Corolla' })
    expect(updated.brand).toBe('Toyota')
    expect(updated.model).toBe('Corolla')
    expect(updated.name).toBe('HB20 Prata') // unchanged
  })

  it('optional fields color and notes are stored', () => {
    const vehicle = Vehicle.reconstitute({
      ...BASE_PROPS,
      color: 'Prata',
      notes: 'Carro do trabalho',
    })
    expect(vehicle.color).toBe('Prata')
    expect(vehicle.notes).toBe('Carro do trabalho')
  })
})
