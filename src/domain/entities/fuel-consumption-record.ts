import type { FuelGaugeMeasurement } from '@/src/domain/entities/fuel-price-record'
import { ValidationError } from '@/src/lib/errors'

export type FuelConsumptionRecord = {
  id: string
  date: Date
  vehicleId: string // FK → Vehicle.id
  fuelTypeId: string // FK → FuelType.id
  startMileage: number
  endMileage: number
  fuelAdded: number // litres
  averageConsumption: number // km/l — computed by calculateAverageConsumption()
  fuelGaugeMeasurement?: FuelGaugeMeasurement
  fuelGaugeTotalCapacity?: number
  tags?: string[]
  notes?: string
}

export type FuelConsumptionCalculationInput = {
  startMileage: number
  endMileage: number
  fuelAdded: number
  fuelGaugeMeasurement?: FuelGaugeMeasurement
  fuelGaugeTotalCapacity?: number
}

/**
 * Calculates average fuel consumption in km/l.
 * When both `fuelGaugeMeasurement` and `fuelGaugeTotalCapacity` are provided,
 * adjusts the effective fuelAdded using the gauge delta.
 *
 * Throws ValidationError when distance <= 0 or fuelAdded <= 0.
 */
export function calculateAverageConsumption(
  input: FuelConsumptionCalculationInput
): number {
  const distance = input.endMileage - input.startMileage
  if (distance <= 0) {
    throw new ValidationError('endMileage must be greater than startMileage')
  }
  if (input.fuelAdded <= 0) {
    throw new ValidationError('fuelAdded must be positive')
  }

  let effectiveFuel = input.fuelAdded
  if (
    input.fuelGaugeMeasurement != null &&
    input.fuelGaugeTotalCapacity != null &&
    input.fuelGaugeTotalCapacity > 0
  ) {
    const gaugeDelta =
      input.fuelGaugeMeasurement.after - input.fuelGaugeMeasurement.before
    effectiveFuel =
      input.fuelAdded + (gaugeDelta / 100) * input.fuelGaugeTotalCapacity
    if (effectiveFuel <= 0) {
      throw new ValidationError(
        'Effective fuel calculated from gauge must be positive'
      )
    }
  }

  return Math.round((distance / effectiveFuel) * 100) / 100
}
