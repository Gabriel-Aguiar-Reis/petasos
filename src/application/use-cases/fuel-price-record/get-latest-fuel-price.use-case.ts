import type { FuelPriceRecord } from '@/src/domain/entities/fuel-price-record'
import type { IFuelPriceRecordRepository } from '@/src/domain/repositories/fuel-price-record.interface.repository'

export class GetLatestFuelPrice {
  constructor(
    private readonly fuelPriceRecordRepository: IFuelPriceRecordRepository
  ) {}

  async execute(fuelTypeId: string): Promise<FuelPriceRecord | null> {
    return this.fuelPriceRecordRepository.findLatestByFuelType(fuelTypeId)
  }
}
