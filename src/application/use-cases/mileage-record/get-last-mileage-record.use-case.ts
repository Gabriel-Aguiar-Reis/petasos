import type { MileageRecord } from '@/src/domain/entities/mileage-record'
import type { IMileageRecordRepository } from '@/src/domain/repositories/mileage-record.interface.repository'

export class GetLastMileageRecord {
  constructor(
    private readonly mileageRecordRepository: IMileageRecordRepository
  ) {}

  async execute(vehicleId: string): Promise<MileageRecord | null> {
    return this.mileageRecordRepository.findLatestByVehicle(vehicleId)
  }
}
