import type { Maintenance } from '@/src/domain/entities/maintenance'
import type { IMaintenanceRepository } from '@/src/domain/repositories/maintenance.interface.repository'

export class GetPendingMaintenances {
  constructor(private readonly repo: IMaintenanceRepository) {}

  async execute(): Promise<Maintenance[]> {
    return this.repo.findPending()
  }
}
