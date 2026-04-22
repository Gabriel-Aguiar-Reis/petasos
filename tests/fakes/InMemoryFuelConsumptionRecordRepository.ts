import type { FuelConsumptionRecord } from '@/src/domain/entities/fuel-consumption-record'
import type { IFuelConsumptionRecordRepository } from '@/src/domain/repositories/fuel-consumption-record.interface.repository'

export class InMemoryFuelConsumptionRecordRepository implements IFuelConsumptionRecordRepository {
  private readonly records: FuelConsumptionRecord[] = []

  async create(record: FuelConsumptionRecord): Promise<FuelConsumptionRecord> {
    this.records.push(record)
    return record
  }

  async findById(id: string): Promise<FuelConsumptionRecord | null> {
    return this.records.find((r) => r.id === id) ?? null
  }

  async findByVehicle(vehicleId: string): Promise<FuelConsumptionRecord[]> {
    return this.records.filter((r) => r.vehicleId === vehicleId)
  }

  async findAll(): Promise<FuelConsumptionRecord[]> {
    return [...this.records]
  }

  async delete(id: string): Promise<void> {
    const idx = this.records.findIndex((r) => r.id === id)
    if (idx !== -1) this.records.splice(idx, 1)
  }
}
