import { Maintenance } from '@/src/domain/entities/maintenance'
import type { IMaintenanceRepository } from '@/src/domain/repositories/maintenance.interface.repository'
import type { CreateMaintenanceInput } from '@/src/domain/validations/maintenance'
import { v4 as uuidv4 } from 'uuid'

export class CreateMaintenance {
  constructor(private readonly repo: IMaintenanceRepository) {}

  async execute(input: CreateMaintenanceInput): Promise<Maintenance> {
    const maintenance = Maintenance.create({ id: uuidv4(), ...input })
    return this.repo.create(maintenance)
  }
}
