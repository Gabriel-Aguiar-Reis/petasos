import { Trip } from './trip'

export type TripOfferRecord = {
  id: string
  platformId: string // FK → TripPlatform.id
  vehicleId: string // FK → Vehicle.id
  date: Date
  offeredFare: number
  estimatedDistance: number
  deadheadDistance: number
  estimatedDuration: number
  deadheadDuration: number
  passengerRating?: number
  notes?: string
}

export type TripOfferPillColor = 'blue' | 'green' | 'orange' | 'red' | 'neutral'

export type TripOfferPillState = {
  estimatedProfit: number
  totalDuration: number
  goalPct: number | null
  color: TripOfferPillColor
  passengerRating: number | null
  ratingColor: TripOfferPillColor
}

export type TripOfferPillThresholds = {
  orangeThresholdPct: number // % below goal → orange (e.g. 15 means within 15% below)
  blueThresholdPct: number // % above goal → blue (e.g. 20 means 20%+ above)
  ratingThresholds?: {
    redBelow: number
    orangeBelow: number
    blueAbove: number
  }
}

export type TripOfferPillEvalInput = {
  offer: TripOfferRecord
  averageConsumption: number // km/l
  fuelPrice: number // per liter
  goalAmount?: number // active daily/period goal amount, null if none
  thresholds?: TripOfferPillThresholds
}

/**
 * Evaluates a trip offer and returns pill state with color coding.
 *
 * Color logic (when goalAmount is set):
 * - blue:    estimatedProfit >= goalAmount * (1 + blueThresholdPct/100)
 * - green:   estimatedProfit >= goalAmount
 * - orange:  estimatedProfit >= goalAmount * (1 - orangeThresholdPct/100)
 * - red:     below orange threshold
 * - neutral: no goalAmount provided
 */
export function evaluateTripOfferPill(
  input: TripOfferPillEvalInput
): TripOfferPillState {
  const { offer, averageConsumption, fuelPrice, goalAmount, thresholds } = input

  const totalDistance = offer.estimatedDistance + offer.deadheadDistance
  const fuelLiters =
    averageConsumption > 0 ? totalDistance / averageConsumption : 0
  const fuelCost = fuelLiters * fuelPrice
  const estimatedProfit = Math.round((offer.offeredFare - fuelCost) * 100) / 100
  const totalDuration = offer.estimatedDuration + offer.deadheadDuration

  let goalPct: number | null = null
  let color: TripOfferPillColor = 'neutral'

  if (goalAmount != null && goalAmount > 0) {
    goalPct = Math.round((estimatedProfit / goalAmount) * 10000) / 100
    const orangePct = thresholds?.orangeThresholdPct ?? 15
    const bluePct = thresholds?.blueThresholdPct ?? 20

    if (estimatedProfit >= goalAmount * (1 + bluePct / 100)) {
      color = 'blue'
    } else if (estimatedProfit >= goalAmount) {
      color = 'green'
    } else if (estimatedProfit >= goalAmount * (1 - orangePct / 100)) {
      color = 'orange'
    } else {
      color = 'red'
    }
  }

  const passengerRating = offer.passengerRating ?? null
  const ratingColor = resolveRatingColor(
    passengerRating,
    thresholds?.ratingThresholds
  )

  return {
    estimatedProfit,
    totalDuration,
    goalPct,
    color,
    passengerRating,
    ratingColor,
  }
}

/**
 * Resolves a rating color from a numeric rating value.
 * Returns 'neutral' when rating is null.
 */
export function resolveRatingColor(
  rating: number | null,
  thresholds?: { redBelow: number; orangeBelow: number; blueAbove: number }
): TripOfferPillColor {
  if (rating == null) return 'neutral'

  const redBelow = thresholds?.redBelow ?? 4.0
  const orangeBelow = thresholds?.orangeBelow ?? 4.5
  const blueAbove = thresholds?.blueAbove ?? 4.8

  if (rating >= blueAbove) return 'blue'
  if (rating >= orangeBelow) return 'green'
  if (rating >= redBelow) return 'orange'
  return 'red'
}

/**
 * Creates a Trip entity from a TripOfferRecord and the actual earnings received.
 */
export function createTripFromOffer(
  offer: TripOfferRecord,
  actualEarnings: number
): Trip {
  return Trip.create({
    id: offer.id,
    date: offer.date,
    earnings: actualEarnings,
    platformId: offer.platformId,
    distance: offer.estimatedDistance,
    duration: offer.estimatedDuration,
    vehicleId: offer.vehicleId,
  })
}
