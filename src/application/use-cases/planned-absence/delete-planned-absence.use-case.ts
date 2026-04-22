import type { IPlannedAbsenceRepository } from '@/src/domain/repositories/planned-absence.interface.repository'

export class DeletePlannedAbsence {
  constructor(private readonly repo: IPlannedAbsenceRepository) {}

  async execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
