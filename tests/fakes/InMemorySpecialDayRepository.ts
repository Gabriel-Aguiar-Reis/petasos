import type { SpecialDay } from '@/src/domain/entities/special-day'
import type { ISpecialDayRepository } from '@/src/domain/repositories/special-day.interface.repository'
import { ConflictError } from '@/src/lib/errors'

export class InMemorySpecialDayRepository implements ISpecialDayRepository {
  private store: Map<string, SpecialDay> = new Map()

  async create(specialDay: SpecialDay): Promise<SpecialDay> {
    this.store.set(specialDay.id, specialDay)
    return specialDay
  }

  async findByDateRange(from: Date, to: Date): Promise<SpecialDay[]> {
    return Array.from(this.store.values()).filter(
      (s) => s.date >= from && s.date <= to
    )
  }

  async findByYear(year: number): Promise<SpecialDay[]> {
    return Array.from(this.store.values()).filter(
      (s) => s.date.getUTCFullYear() === year
    )
  }

  async upsertOfficial(specialDay: SpecialDay): Promise<SpecialDay> {
    // Deduplicate by date + source (find existing official for same date)
    const existing = Array.from(this.store.values()).find(
      (s) =>
        s.source === 'official' && s.date.getTime() === specialDay.date.getTime()
    )
    if (existing) {
      this.store.delete(existing.id)
    }
    this.store.set(specialDay.id, specialDay)
    return specialDay
  }

  async delete(id: string): Promise<void> {
    const item = this.store.get(id)
    if (item?.source === 'official') {
      throw new ConflictError('Cannot delete official special day')
    }
    this.store.delete(id)
  }
}
