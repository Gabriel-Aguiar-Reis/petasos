import type { FuelType } from '@/src/domain/entities/fuel-type'

export interface IFuelTypeRepository {
  create(fuelType: FuelType): Promise<FuelType>
  findById(id: string): Promise<FuelType>
  findAll(): Promise<FuelType[]>
  update(fuelType: FuelType): Promise<FuelType>
  delete(id: string): Promise<void>
}
