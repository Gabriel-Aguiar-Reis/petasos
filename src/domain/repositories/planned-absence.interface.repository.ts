import type { PlannedAbsence } from '../entities/planned-absence'

export interface IPlannedAbsenceRepository {
  create(absence: PlannedAbsence): Promise<PlannedAbsence>
  findById(id: string): Promise<PlannedAbsence | null>
  findByDateRange(from: Date, to: Date): Promise<PlannedAbsence[]>
  update(absence: PlannedAbsence): Promise<PlannedAbsence>
  delete(id: string): Promise<void>
}
