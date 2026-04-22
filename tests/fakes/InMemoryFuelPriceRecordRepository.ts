import type { FuelPriceRecord } from '@/src/domain/entities/fuel-price-record'
import type { IFuelPriceRecordRepository } from '@/src/domain/repositories/fuel-price-record.interface.repository'

export class InMemoryFuelPriceRecordRepository implements IFuelPriceRecordRepository {
  private readonly records: FuelPriceRecord[] = []

  async create(record: FuelPriceRecord): Promise<FuelPriceRecord> {
    this.records.push(record)
    return record
  }

  async findLatestByFuelType(
    fuelTypeId: string
  ): Promise<FuelPriceRecord | null> {
    const filtered = this.records
      .filter((r) => r.fuelTypeId === fuelTypeId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
    return filtered[0] ?? null
  }

  async findAll(): Promise<FuelPriceRecord[]> {
    return [...this.records]
  }

  async delete(id: string): Promise<void> {
    const idx = this.records.findIndex((r) => r.id === id)
    if (idx !== -1) this.records.splice(idx, 1)
  }
}
