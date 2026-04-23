import { TripOfferRecord } from '@/src/domain/entities/trip-offer-record'

export interface ITripOfferRecordRepository {
  create(record: TripOfferRecord): Promise<TripOfferRecord>
  findById(id: string): Promise<TripOfferRecord | null>
  findAll(): Promise<TripOfferRecord[]>
  findByDateRange(from: Date, to: Date): Promise<TripOfferRecord[]>
  delete(id: string): Promise<void>
}
