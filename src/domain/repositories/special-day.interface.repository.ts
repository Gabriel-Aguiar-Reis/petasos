import type { SpecialDay } from '../entities/special-day'

export interface ISpecialDayRepository {
  create(specialDay: SpecialDay): Promise<SpecialDay>
  findByDateRange(from: Date, to: Date): Promise<SpecialDay[]>
  findByYear(year: number): Promise<SpecialDay[]>
  upsertOfficial(specialDay: SpecialDay): Promise<SpecialDay>
  delete(id: string): Promise<void>
}
