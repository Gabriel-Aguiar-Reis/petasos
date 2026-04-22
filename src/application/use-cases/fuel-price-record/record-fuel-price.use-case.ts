import type { FuelPriceRecord } from '@/src/domain/entities/fuel-price-record'
import type { IFuelPriceRecordRepository } from '@/src/domain/repositories/fuel-price-record.interface.repository'
import {
  CreateFuelPriceRecordSchema,
  type CreateFuelPriceRecordInput,
} from '@/src/domain/validations/fuel-price-record'
import { ValidationError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

export class RecordFuelPrice {
  constructor(
    private readonly fuelPriceRecordRepository: IFuelPriceRecordRepository
  ) {}

  async execute(input: CreateFuelPriceRecordInput): Promise<FuelPriceRecord> {
    const result = CreateFuelPriceRecordSchema.safeParse(input)
    if (!result.success) {
      throw new ValidationError(result.error.issues[0].message)
    }
    const data = result.data
    const record: FuelPriceRecord = {
      id: uuidv4(),
      fuelTypeId: data.fuelTypeId,
      date: data.date ?? new Date(),
      pricePerLiter: data.pricePerLiter,
      notes: data.notes,
    }
    return this.fuelPriceRecordRepository.create(record)
  }
}
