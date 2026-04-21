import { resolveRatingColor, evaluateTripOfferPill } from '@/src/domain/entities/trip-offer-record'

describe('resolveRatingColor coverage', () => {
  it('returns neutral for null rating', () => {
    expect(resolveRatingColor(null)).toBe('neutral')
  })

  it('returns blue for very high rating', () => {
    expect(resolveRatingColor(5.0)).toBe('blue')
  })

  it('returns green for moderately high rating', () => {
    expect(resolveRatingColor(4.6)).toBe('green')
  })

  it('returns orange for mid rating', () => {
    expect(resolveRatingColor(4.2)).toBe('orange')
  })

  it('returns red for low rating', () => {
    expect(resolveRatingColor(3.5)).toBe('red')
  })
})

describe('evaluateTripOfferPill branch coverage', () => {
  it('handles averageConsumption <= 0 (fuelLiters -> 0) branch', () => {
    const state = evaluateTripOfferPill({
      offer: {
        id: 'o1',
        platformId: 'p1',
        vehicleId: 'v1',
        date: new Date(),
        offeredFare: 20,
        estimatedDistance: 10,
        deadheadDistance: 2,
        estimatedDuration: 15,
        deadheadDuration: 5,
      },
      averageConsumption: 0,
      fuelPrice: 5,
    } as any)

    expect(state.estimatedProfit).toBe(20)
    expect(state.color).toBe('neutral')
  })
})

