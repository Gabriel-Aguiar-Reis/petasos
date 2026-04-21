import type { Trip } from '@/src/domain/entities/trip'
import { createTripFromOffer } from '@/src/domain/entities/trip-offer-record'
import type { ITripOfferRecordRepository } from '@/src/domain/repositories/trip-offer-record.interface.repository'
import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'
import { NotFoundError } from '@/src/lib/errors'

export class CreateTripFromOffer {
  constructor(
    private readonly tripOfferRecordRepository: ITripOfferRecordRepository,
    private readonly tripRepository: ITripRepository
  ) {}

  async execute(offerId: string, actualEarnings: number): Promise<Trip> {
    const offer = await this.tripOfferRecordRepository.findById(offerId)
    if (!offer) {
      throw new NotFoundError('TripOfferRecord', offerId)
    }
    const trip = createTripFromOffer(offer, actualEarnings)
    return this.tripRepository.create(trip)
  }
}
