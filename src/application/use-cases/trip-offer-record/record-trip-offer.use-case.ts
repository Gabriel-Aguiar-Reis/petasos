import type { TripOfferRecord } from '@/src/domain/entities/trip-offer-record'
import type { ITripOfferRecordRepository } from '@/src/domain/repositories/trip-offer-record.interface.repository'
import {
  CreateTripOfferRecordSchema,
  type CreateTripOfferRecordInput,
} from '@/src/domain/validations/trip-offer-record'
import { ValidationError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

export class RecordTripOffer {
  constructor(
    private readonly tripOfferRecordRepository: ITripOfferRecordRepository
  ) {}

  async execute(input: CreateTripOfferRecordInput): Promise<TripOfferRecord> {
    const result = CreateTripOfferRecordSchema.safeParse(input)
    if (!result.success) {
      throw new ValidationError(result.error.issues[0].message)
    }
    const data = result.data
    const record: TripOfferRecord = {
      id: uuidv4(),
      platformId: data.platformId,
      vehicleId: data.vehicleId,
      date: data.date ?? new Date(),
      offeredFare: data.offeredFare,
      estimatedDistance: data.estimatedDistance,
      deadheadDistance: data.deadheadDistance,
      estimatedDuration: data.estimatedDuration,
      deadheadDuration: data.deadheadDuration,
      passengerRating: data.passengerRating,
      notes: data.notes,
    }
    return this.tripOfferRecordRepository.create(record)
  }
}
