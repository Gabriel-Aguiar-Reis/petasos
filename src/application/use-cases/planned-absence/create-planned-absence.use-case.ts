import { PlannedAbsence } from '@/src/domain/entities/planned-absence'
import type { IPlannedAbsenceRepository } from '@/src/domain/repositories/planned-absence.interface.repository'
import type { CreatePlannedAbsenceInput } from '@/src/domain/validations/planned-absence'
import { v4 as uuidv4 } from 'uuid'

export class CreatePlannedAbsence {
  constructor(private readonly repo: IPlannedAbsenceRepository) {}

  async execute(input: CreatePlannedAbsenceInput): Promise<PlannedAbsence> {
    const absence = PlannedAbsence.create({ id: uuidv4(), ...input })
    return this.repo.create(absence)
  }
}
