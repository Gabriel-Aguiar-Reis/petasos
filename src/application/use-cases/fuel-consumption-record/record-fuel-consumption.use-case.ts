import {
  calculateAverageConsumption,
  type FuelConsumptionRecord,
} from '@/src/domain/entities/fuel-consumption-record'
import type { IFuelConsumptionRecordRepository } from '@/src/domain/repositories/fuel-consumption-record.interface.repository'
import {
  CreateFuelConsumptionRecordSchema,
  type CreateFuelConsumptionRecordInput,
} from '@/src/domain/validations/fuel-consumption-record'
import { ValidationError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

export class RecordFuelConsumption {
  constructor(
    private readonly fuelConsumptionRecordRepository: IFuelConsumptionRecordRepository
  ) {}

  async execute(
    input: CreateFuelConsumptionRecordInput
  ): Promise<FuelConsumptionRecord> {
    const result = CreateFuelConsumptionRecordSchema.safeParse(input)
    if (!result.success) {
      throw new ValidationError(result.error.issues[0].message)
    }
    const data = result.data
    const averageConsumption = calculateAverageConsumption({
      startMileage: data.startMileage,
      endMileage: data.endMileage,
      fuelAdded: data.fuelAdded,
      fuelGaugeMeasurement: data.fuelGaugeMeasurement,
      fuelGaugeTotalCapacity: data.fuelGaugeTotalCapacity,
    })
    const record: FuelConsumptionRecord = {
      id: uuidv4(),
      vehicleId: data.vehicleId,
      fuelTypeId: data.fuelTypeId,
      date: data.date ?? new Date(),
      startMileage: data.startMileage,
      endMileage: data.endMileage,
      fuelAdded: data.fuelAdded,
      averageConsumption,
      fuelGaugeMeasurement: data.fuelGaugeMeasurement,
      fuelGaugeTotalCapacity: data.fuelGaugeTotalCapacity,
      tags: data.tags,
      notes: data.notes,
    }
    return this.fuelConsumptionRecordRepository.create(record)
  }
}
