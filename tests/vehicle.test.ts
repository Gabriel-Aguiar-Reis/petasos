import { Vehicle } from '@/src/domain/entities/vehicle'

describe('Vehicle entity', () => {
  it('reconstitute creates a vehicle from stored props', () => {
    const vehicle = Vehicle.reconstitute({
      id: '1',
      name: 'HB20 Prata',
      plate: 'ABC-1234',
    })
    expect(vehicle.id).toBe('1')
    expect(vehicle.name).toBe('HB20 Prata')
    expect(vehicle.plate).toBe('ABC-1234')
  })

  it('hasPlate is true when plate is set', () => {
    const vehicle = Vehicle.reconstitute({
      id: '1',
      name: 'HB20',
      plate: 'ABC-1234',
    })
    expect(vehicle.hasPlate).toBe(true)
  })

  it('hasPlate is false when plate is null', () => {
    const vehicle = Vehicle.reconstitute({ id: '1', name: 'HB20', plate: null })
    expect(vehicle.hasPlate).toBe(false)
  })

  it('hasPlate is false when plate is an empty string', () => {
    const vehicle = Vehicle.reconstitute({ id: '1', name: 'HB20', plate: '   ' })
    expect(vehicle.hasPlate).toBe(false)
  })

  it('displayName includes plate when present', () => {
    const vehicle = Vehicle.reconstitute({
      id: '1',
      name: 'HB20 Prata',
      plate: 'ABC-1234',
    })
    expect(vehicle.displayName).toBe('HB20 Prata (ABC-1234)')
  })

  it('displayName returns just name when plate is absent', () => {
    const vehicle = Vehicle.reconstitute({
      id: '1',
      name: 'HB20 Prata',
      plate: null,
    })
    expect(vehicle.displayName).toBe('HB20 Prata')
  })
})
