import {
  evaluateTripOfferPill,
  type TripOfferPillEvalInput,
  type TripOfferPillState,
  type TripOfferRecord,
} from '@/src/domain/entities/trip-offer-record'

export type TripOfferEvalContext = {
  averageConsumption: number // km/l from vehicle
  fuelPrice: number // price per liter (latest for vehicle's fuel type)
  goalAmount?: number // active saved profit goal target, if any
  thresholds?: TripOfferPillEvalInput['thresholds'] // from UserSettings.tripOfferPill
}

/**
 * Application service that orchestrates resolving evaluation context
 * (goal, fuel price, vehicle consumption, user settings) and delegates
 * to the pure domain function `evaluateTripOfferPill`.
 *
 * Callers are responsible for loading the context via their respective
 * repositories and passing it in — this keeps the service thin and
 * fully testable without database access.
 */
export class TripOfferEvalService {
  evaluate(
    offer: TripOfferRecord,
    context: TripOfferEvalContext
  ): TripOfferPillState {
    return evaluateTripOfferPill({
      offer,
      averageConsumption: context.averageConsumption,
      fuelPrice: context.fuelPrice,
      goalAmount: context.goalAmount,
      thresholds: context.thresholds,
    })
  }
}
