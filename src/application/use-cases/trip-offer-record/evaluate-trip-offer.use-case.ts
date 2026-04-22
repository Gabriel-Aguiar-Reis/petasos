import {
  TripOfferEvalService,
  type TripOfferEvalContext,
} from '@/src/application/services/trip-offer-eval.service'
import type { TripOfferPillState } from '@/src/domain/entities/trip-offer-record'
import type { ITripOfferRecordRepository } from '@/src/domain/repositories/trip-offer-record.interface.repository'
import { NotFoundError } from '@/src/lib/errors'

export class EvaluateTripOffer {
  private readonly evalService = new TripOfferEvalService()

  constructor(
    private readonly tripOfferRecordRepository: ITripOfferRecordRepository
  ) {}

  async execute(
    id: string,
    context: TripOfferEvalContext
  ): Promise<TripOfferPillState> {
    const record = await this.tripOfferRecordRepository.findById(id)
    if (!record) {
      throw new NotFoundError('TripOfferRecord', id)
    }
    return this.evalService.evaluate(record, context)
  }
}
