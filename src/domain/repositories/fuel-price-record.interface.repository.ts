import type { FuelPriceRecord } from '@/src/domain/entities/fuel-price-record'

export interface IFuelPriceRecordRepository {
  create(record: FuelPriceRecord): Promise<FuelPriceRecord>
  findLatestByFuelType(fuelTypeId: string): Promise<FuelPriceRecord | null>
  findAll(): Promise<FuelPriceRecord[]>
  delete(id: string): Promise<void>
}
