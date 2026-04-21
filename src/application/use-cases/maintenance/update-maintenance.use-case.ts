import type { Maintenance } from '@/src/domain/entities/maintenance'
import type { IMaintenanceRepository } from '@/src/domain/repositories/maintenance.interface.repository'
import type { UpdateMaintenanceInput } from '@/src/domain/validations/maintenance'
import { NotFoundError } from '@/src/lib/errors'

export class UpdateMaintenance {
  constructor(private readonly repo: IMaintenanceRepository) {}

  async execute(
    id: string,
    input: UpdateMaintenanceInput
  ): Promise<Maintenance> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('Maintenance', id)
    const updated = existing.update(input)
    return this.repo.update(updated)
  }
}
