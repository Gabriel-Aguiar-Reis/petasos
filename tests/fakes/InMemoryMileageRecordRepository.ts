import type { MileageRecord } from '@/src/domain/entities/mileage-record'
import type { IMileageRecordRepository } from '@/src/domain/repositories/mileage-record.interface.repository'
import { NotFoundError } from '@/src/lib/errors'

export class InMemoryMileageRecordRepository implements IMileageRecordRepository {
  private store: Map<string, MileageRecord> = new Map()

  async create(record: MileageRecord): Promise<MileageRecord> {
    this.store.set(record.id, record)
    return record
  }

  async findLatestByVehicle(vehicleId: string): Promise<MileageRecord | null> {
    const records = Array.from(this.store.values()).filter(
      (r) => r.vehicleId === vehicleId
    )
    if (records.length === 0) return null
    return records.reduce((best, r) => (r.mileage > best.mileage ? r : best))
  }

  async findByVehicle(vehicleId: string): Promise<MileageRecord[]> {
    return Array.from(this.store.values())
      .filter((r) => r.vehicleId === vehicleId)
      .sort((a, b) => b.mileage - a.mileage)
  }

  async delete(id: string): Promise<void> {
    if (!this.store.has(id)) throw new NotFoundError('MileageRecord', id)
    this.store.delete(id)
  }
}
