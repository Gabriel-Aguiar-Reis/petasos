import type { IFuelTypeRepository } from '@/src/domain/repositories/fuel-type.interface.repository'

export class DeleteFuelType {
  constructor(private readonly fuelTypeRepository: IFuelTypeRepository) {}

  async execute(id: string): Promise<void> {
    return this.fuelTypeRepository.delete(id)
  }
}
