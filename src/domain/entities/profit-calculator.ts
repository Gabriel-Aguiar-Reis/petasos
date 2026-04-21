import { ValidationError } from '@/src/lib/errors'

type ProfitTarget =
  | { type: 'percentage'; value: number }
  | { type: 'amount'; value: number }

export type ProfitCalculationInput = {
  distance: number
  deadheadDistance?: number
  averageConsumption: number
  fuelPrice: number
  profitTarget: ProfitTarget
  tolls?: number
}

/**
 * Calculates estimated profit for a trip offer.
 * - `percentage` target: returns what percentage of (earnings - fuelCost) should be profit
 * - `amount` target: returns earnings minus fuelCost minus tolls
 *
 * Throws ValidationError when distance <= 0, averageConsumption <= 0, or fuelPrice <= 0.
 */
export function calculateProfit(input: ProfitCalculationInput): number {
  if (input.distance <= 0) {
    throw new ValidationError('Trip distance must be positive')
  }
  if (input.averageConsumption <= 0) {
    throw new ValidationError('Average consumption must be positive')
  }
  if (input.fuelPrice <= 0) {
    throw new ValidationError('Fuel price must be positive')
  }

  const totalDistance = input.distance + (input.deadheadDistance ?? 0)
  const fuelLiters = totalDistance / input.averageConsumption
  const fuelCost = fuelLiters * input.fuelPrice
  const tolls = input.tolls ?? 0

  if (input.profitTarget.type === 'percentage') {
    const pct = input.profitTarget.value / 100
    const netEarnings = (input.distance / totalDistance) * 100 * pct
    // For percentage mode: minimum fare = (fuelCost + tolls) / (1 - pct)
    return Math.round(((fuelCost + tolls) / (1 - pct)) * 100) / 100
  }

  // amount mode: earned amount - fuelCost - tolls
  const net = input.profitTarget.value - fuelCost - tolls
  return Math.round(net * 100) / 100
}

export type FuelCostInput = {
  amountSpent: number
  pricePerLiter: number
}

/**
 * Calculates liters purchased given amount spent and price per liter.
 * Throws ValidationError when pricePerLiter <= 0.
 */
export function calculateFuelLiters(input: FuelCostInput): number {
  if (input.pricePerLiter <= 0) {
    throw new ValidationError('Price per liter must be positive')
  }
  const liters = input.amountSpent / input.pricePerLiter
  return Math.round(liters * 1000) / 1000
}
