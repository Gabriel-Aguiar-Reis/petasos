import type { IMaintenanceRepository } from '@/src/domain/repositories/maintenance.interface.repository'

export class DeleteMaintenance {
  constructor(private readonly repo: IMaintenanceRepository) {}

  async execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
