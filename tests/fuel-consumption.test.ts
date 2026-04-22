import { calculateAverageConsumption } from '@/src/domain/entities/fuel-consumption-record'
import { ValidationError } from '@/src/lib/errors'

describe('calculateAverageConsumption', () => {
  it('calculates average consumption without gauge', () => {
    const result = calculateAverageConsumption({
      startMileage: 1000,
      endMileage: 1100,
      fuelAdded: 10,
    })
    expect(result).toBe(10) // 100km / 10l
  })

  it('adjusts consumption with gauge measurement', () => {
    // gaugeAfter - gaugeBefore = 50-30 = 20% filled; totalCapacity = 50l → +10l
    // effectiveFuel = 8 + 10 = 18l; distance = 180; avg = 10
    const result = calculateAverageConsumption({
      startMileage: 0,
      endMileage: 180,
      fuelAdded: 8,
      fuelGaugeMeasurement: { before: 30, after: 50 },
      fuelGaugeTotalCapacity: 50,
    })
    expect(result).toBe(10)
  })

  it('throws ValidationError when distance <= 0', () => {
    expect(() =>
      calculateAverageConsumption({
        startMileage: 100,
        endMileage: 100,
        fuelAdded: 5,
      })
    ).toThrow(ValidationError)
  })

  it('throws ValidationError when endMileage < startMileage', () => {
    expect(() =>
      calculateAverageConsumption({
        startMileage: 200,
        endMileage: 100,
        fuelAdded: 5,
      })
    ).toThrow(ValidationError)
  })

  it('throws ValidationError when fuelAdded <= 0', () => {
    expect(() =>
      calculateAverageConsumption({
        startMileage: 100,
        endMileage: 200,
        fuelAdded: 0,
      })
    ).toThrow(ValidationError)
  })
})
