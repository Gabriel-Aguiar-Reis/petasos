import {
  calculateFuelLiters,
  calculateProfit,
} from '@/src/domain/entities/profit-calculator'
import {
  evaluateTripOfferPill,
  resolveRatingColor,
  type TripOfferRecord,
} from '@/src/domain/entities/trip-offer-record'
import { ValidationError } from '@/src/lib/errors'

const BASE_OFFER: TripOfferRecord = {
  id: 'offer-1',
  platformId: 'platform-1',
  vehicleId: 'vehicle-1',
  date: new Date('2025-01-01'),
  offeredFare: 30,
  estimatedDistance: 10,
  deadheadDistance: 2,
  estimatedDuration: 20,
  deadheadDuration: 5,
}

describe('evaluateTripOfferPill', () => {
  const context = {
    averageConsumption: 12, // km/l
    fuelPrice: 6, // R$/l
    thresholds: { orangeThresholdPct: 15, blueThresholdPct: 20 },
  }

  it('returns neutral when no goalAmount is provided', () => {
    const result = evaluateTripOfferPill({ offer: BASE_OFFER, ...context })
    expect(result.color).toBe('neutral')
    expect(result.goalPct).toBeNull()
  })

  it('returns blue when profit is 20%+ above goal', () => {
    // totalDistance=12, fuelLiters=1, fuelCost=6, profit=24
    // goal=19 → 24/19 ≈ 126% → blue (>120%)
    const result = evaluateTripOfferPill({
      offer: BASE_OFFER,
      ...context,
      goalAmount: 19,
    })
    expect(result.color).toBe('blue')
  })

  it('returns green when profit meets goal exactly', () => {
    // profit = 30 - 6 = 24, goal = 24
    const result = evaluateTripOfferPill({
      offer: BASE_OFFER,
      ...context,
      goalAmount: 24,
    })
    expect(result.color).toBe('green')
  })

  it('returns orange when within 15% below goal', () => {
    // profit=24, goal=27 → 24/27≈88.9% → above 85% → orange
    const result = evaluateTripOfferPill({
      offer: BASE_OFFER,
      ...context,
      goalAmount: 27,
    })
    expect(result.color).toBe('orange')
  })

  it('returns red when profit is below orange threshold', () => {
    // profit=24, goal=40 → 60% < 85% → red
    const result = evaluateTripOfferPill({
      offer: BASE_OFFER,
      ...context,
      goalAmount: 40,
    })
    expect(result.color).toBe('red')
  })

  it('calculates totalDuration correctly', () => {
    const result = evaluateTripOfferPill({ offer: BASE_OFFER, ...context })
    expect(result.totalDuration).toBe(25) // 20 + 5
  })

  it('returns passengerRating from offer', () => {
    const result = evaluateTripOfferPill({
      offer: { ...BASE_OFFER, passengerRating: 4.2 },
      ...context,
    })
    expect(result.passengerRating).toBe(4.2)
  })
})

describe('resolveRatingColor', () => {
  it('returns neutral when rating is null', () => {
    expect(resolveRatingColor(null)).toBe('neutral')
  })

  it('returns blue when rating is above blueAbove threshold', () => {
    expect(
      resolveRatingColor(4.9, {
        redBelow: 4.0,
        orangeBelow: 4.5,
        blueAbove: 4.8,
      })
    ).toBe('blue')
  })

  it('returns green when between orangeBelow and blueAbove', () => {
    expect(
      resolveRatingColor(4.6, {
        redBelow: 4.0,
        orangeBelow: 4.5,
        blueAbove: 4.8,
      })
    ).toBe('green')
  })

  it('returns orange when between redBelow and orangeBelow', () => {
    expect(
      resolveRatingColor(4.2, {
        redBelow: 4.0,
        orangeBelow: 4.5,
        blueAbove: 4.8,
      })
    ).toBe('orange')
  })

  it('returns red when below redBelow threshold', () => {
    expect(
      resolveRatingColor(3.8, {
        redBelow: 4.0,
        orangeBelow: 4.5,
        blueAbove: 4.8,
      })
    ).toBe('red')
  })
})

describe('calculateProfit', () => {
  it('calculates profit in amount mode', () => {
    const result = calculateProfit({
      distance: 10,
      deadheadDistance: 2,
      averageConsumption: 12,
      fuelPrice: 6,
      profitTarget: { type: 'amount', value: 30 },
    })
    // fuelCost = 12/12 * 6 = 6; profit = 30 - 6 = 24
    expect(result).toBe(24)
  })

  it('calculates minimum fare in percentage mode', () => {
    const result = calculateProfit({
      distance: 10,
      averageConsumption: 10,
      fuelPrice: 5,
      profitTarget: { type: 'percentage', value: 50 },
    })
    // fuelCost = 1 * 5 = 5; minFare = 5 / (1-0.5) = 10
    expect(result).toBe(10)
  })

  it('throws ValidationError when distance <= 0', () => {
    expect(() =>
      calculateProfit({
        distance: 0,
        averageConsumption: 10,
        fuelPrice: 5,
        profitTarget: { type: 'amount', value: 20 },
      })
    ).toThrow(ValidationError)
  })

  it('throws ValidationError when fuelPrice <= 0', () => {
    expect(() =>
      calculateProfit({
        distance: 10,
        averageConsumption: 10,
        fuelPrice: 0,
        profitTarget: { type: 'amount', value: 20 },
      })
    ).toThrow(ValidationError)
  })
})

describe('calculateFuelLiters', () => {
  it('calculates liters correctly', () => {
    const result = calculateFuelLiters({ amountSpent: 100, pricePerLiter: 5 })
    expect(result).toBe(20)
  })

  it('throws ValidationError when pricePerLiter <= 0', () => {
    expect(() =>
      calculateFuelLiters({ amountSpent: 100, pricePerLiter: 0 })
    ).toThrow(ValidationError)
  })

  it('throws ValidationError when pricePerLiter is negative', () => {
    expect(() =>
      calculateFuelLiters({ amountSpent: 100, pricePerLiter: -1 })
    ).toThrow(ValidationError)
  })
})
