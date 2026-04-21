import type { PlannedAbsence } from '@/src/domain/entities/planned-absence'
import type { IPlannedAbsenceRepository } from '@/src/domain/repositories/planned-absence.interface.repository'

export class InMemoryPlannedAbsenceRepository implements IPlannedAbsenceRepository {
  private store: Map<string, PlannedAbsence> = new Map()

  async create(absence: PlannedAbsence): Promise<PlannedAbsence> {
    this.store.set(absence.id, absence)
    return absence
  }

  async findById(id: string): Promise<PlannedAbsence | null> {
    return this.store.get(id) ?? null
  }

  async findByDateRange(from: Date, to: Date): Promise<PlannedAbsence[]> {
    return Array.from(this.store.values()).filter(
      (a) => a.date >= from && a.date <= to
    )
  }

  async update(absence: PlannedAbsence): Promise<PlannedAbsence> {
    this.store.set(absence.id, absence)
    return absence
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
