import { resolveRatingColor } from '@/src/domain/entities/trip-offer-record'

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
