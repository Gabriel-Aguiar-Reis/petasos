import type { Profit } from '@/src/domain/entities/profit'

export interface IProfitRepository {
  create(profit: Profit): Promise<Profit>
  findById(id: string): Promise<Profit | null>
  findAll(): Promise<Profit[]>
  findByDateRange(from: Date, to: Date): Promise<Profit[]>
  update(profit: Profit): Promise<Profit>
  delete(id: string): Promise<void>
}
