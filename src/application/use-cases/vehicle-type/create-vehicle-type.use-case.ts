import type { VehicleType } from '@/src/domain/entities/vehicle-type'
import type { IVehicleTypeRepository } from '@/src/domain/repositories/vehicle-type.interface.repository'
import type { CreateVehicleTypeInput } from '@/src/domain/validations/vehicle-type'
import { v4 as uuidv4 } from 'uuid'

export class CreateVehicleType {
  constructor(private readonly vehicleTypeRepository: IVehicleTypeRepository) {}

  async execute(input: CreateVehicleTypeInput): Promise<VehicleType> {
    const vehicleType: VehicleType = { id: uuidv4(), ...input }
    return this.vehicleTypeRepository.create(vehicleType)
  }
}
