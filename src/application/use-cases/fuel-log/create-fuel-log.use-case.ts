import { FuelLog } from '@/src/domain/entities/fuel-log'
import type { IFuelLogRepository } from '@/src/domain/repositories/fuel-log.interface.repository'
import type { CreateFuelLogInput } from '@/src/domain/validations/fuel-log'
import { ValidationError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

export class CreateFuelLog {
  constructor(private readonly fuelLogRepository: IFuelLogRepository) { }

  async execute(input: CreateFuelLogInput): Promise<FuelLog> {
    const log = FuelLog.create({ id: uuidv4(), ...input })

    // Validate odometer monotonicity per fuel type (FR-009 / FR-019)
    const existingLogs =
      await this.fuelLogRepository.findByFuelTypeOrderedByOdometer(log.fuelType)
    if (existingLogs.length > 0) {
      const lastLog = existingLogs[existingLogs.length - 1]
      if (log.odometer <= lastLog.odometer) {
        throw new ValidationError(
          `odometer (${log.odometer}) must be greater than the previous ${log.fuelType} log (${lastLog.odometer})`
        )
      }
    }

    return this.fuelLogRepository.create(log)
  }
}
