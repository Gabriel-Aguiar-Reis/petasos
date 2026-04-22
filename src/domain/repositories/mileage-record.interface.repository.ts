import type { MileageRecord } from '@/src/domain/entities/mileage-record'

export interface IMileageRecordRepository {
  create(record: MileageRecord): Promise<MileageRecord>
  findLatestByVehicle(vehicleId: string): Promise<MileageRecord | null>
  findByVehicle(vehicleId: string): Promise<MileageRecord[]>
  delete(id: string): Promise<void>
}
