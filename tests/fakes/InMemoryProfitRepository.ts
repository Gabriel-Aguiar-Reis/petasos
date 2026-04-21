import type { Profit } from '@/src/domain/entities/profit'
import type { IProfitRepository } from '@/src/domain/repositories/profit.interface.repository'

export class InMemoryProfitRepository implements IProfitRepository {
  private store: Map<string, Profit> = new Map()

  async create(profit: Profit): Promise<Profit> {
    this.store.set(profit.id, profit)
    return profit
  }

  async findById(id: string): Promise<Profit | null> {
    return this.store.get(id) ?? null
  }

  async findAll(): Promise<Profit[]> {
    return Array.from(this.store.values())
  }

  async findByDateRange(from: Date, to: Date): Promise<Profit[]> {
    return Array.from(this.store.values()).filter(
      (p) => p.date >= from && p.date <= to
    )
  }

  async update(profit: Profit): Promise<Profit> {
    this.store.set(profit.id, profit)
    return profit
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
