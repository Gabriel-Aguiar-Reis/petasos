import type { FuelLog } from '@/src/domain/entities/fuel-log'

export interface IFuelLogRepository {
  create(log: FuelLog): Promise<FuelLog>
  findById(id: string): Promise<FuelLog>
  findAll(): Promise<FuelLog[]>
  findByFuelTypeOrderedByOdometer(fuelType: string): Promise<FuelLog[]>
  update(log: FuelLog): Promise<FuelLog>
  delete(id: string): Promise<void>
}
