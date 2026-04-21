import type { MileageRecord } from '@/src/domain/entities/mileage-record'
import type { IMileageRecordRepository } from '@/src/domain/repositories/mileage-record.interface.repository'
import { CreateMileageRecordSchema } from '@/src/domain/validations/mileage-record'
import { ValidationError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

export class CreateMileageRecord {
  constructor(
    private readonly mileageRecordRepository: IMileageRecordRepository
  ) {}

  async execute(
    input: Parameters<typeof CreateMileageRecordSchema.parse>[0]
  ): Promise<MileageRecord> {
    const result = CreateMileageRecordSchema.safeParse(input)
    if (!result.success)
      throw new ValidationError(result.error.issues[0].message)
    const d = result.data
    const record: MileageRecord = {
      id: uuidv4(),
      vehicleId: d.vehicleId,
      mileage: d.mileage,
      date: d.date ?? new Date(),
      notes: d.notes,
    }
    return this.mileageRecordRepository.create(record)
  }
}
