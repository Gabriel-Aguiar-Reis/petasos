import type { TripOfferRecord } from '@/src/domain/entities/trip-offer-record'
import type { ITripOfferRecordRepository } from '@/src/domain/repositories/trip-offer-record.interface.repository'

export class InMemoryTripOfferRecordRepository implements ITripOfferRecordRepository {
  private readonly records: TripOfferRecord[] = []

  async create(record: TripOfferRecord): Promise<TripOfferRecord> {
    this.records.push(record)
    return record
  }

  async findById(id: string): Promise<TripOfferRecord | null> {
    return this.records.find((r) => r.id === id) ?? null
  }

  async findAll(): Promise<TripOfferRecord[]> {
    return [...this.records]
  }

  async findByDateRange(from: Date, to: Date): Promise<TripOfferRecord[]> {
    return this.records.filter((r) => r.date >= from && r.date <= to)
  }

  async delete(id: string): Promise<void> {
    const idx = this.records.findIndex((r) => r.id === id)
    if (idx !== -1) this.records.splice(idx, 1)
  }
}
