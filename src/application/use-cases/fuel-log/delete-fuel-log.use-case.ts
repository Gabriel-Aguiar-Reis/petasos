import type { IFuelLogRepository } from '@/src/domain/repositories/fuel-log.interface.repository'

export class DeleteFuelLog {
  constructor(private readonly fuelLogRepository: IFuelLogRepository) {}

  async execute(id: string): Promise<void> {
    await this.fuelLogRepository.findById(id)
    await this.fuelLogRepository.delete(id)
  }
}
