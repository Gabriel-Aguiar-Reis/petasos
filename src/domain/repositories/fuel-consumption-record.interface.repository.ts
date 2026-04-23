import type { FuelConsumptionRecord } from '@/src/domain/entities/fuel-consumption-record'

export interface IFuelConsumptionRecordRepository {
  create(record: FuelConsumptionRecord): Promise<FuelConsumptionRecord>
  findById(id: string): Promise<FuelConsumptionRecord | null>
  findByVehicle(vehicleId: string): Promise<FuelConsumptionRecord[]>
  findAll(): Promise<FuelConsumptionRecord[]>
  delete(id: string): Promise<void>
}
