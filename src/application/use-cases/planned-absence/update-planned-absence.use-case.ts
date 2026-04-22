import type { PlannedAbsence } from '@/src/domain/entities/planned-absence'
import type { IPlannedAbsenceRepository } from '@/src/domain/repositories/planned-absence.interface.repository'
import type { UpdatePlannedAbsenceInput } from '@/src/domain/validations/planned-absence'
import { NotFoundError } from '@/src/lib/errors'

export class UpdatePlannedAbsence {
  constructor(private readonly repo: IPlannedAbsenceRepository) {}

  async execute(
    id: string,
    input: UpdatePlannedAbsenceInput
  ): Promise<PlannedAbsence> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('PlannedAbsence', id)
    const updated = existing.update(input)
    return this.repo.update(updated)
  }
}
