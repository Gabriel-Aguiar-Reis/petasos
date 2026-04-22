import { Cost } from '@/src/domain/entities/cost'
import type { ICostRepository } from '@/src/domain/repositories/cost.interface.repository'
import { NotFoundError } from '@/src/lib/errors'
import type { CostFilter } from '@/src/types/shared.types'

export class InMemoryCostRepository implements ICostRepository {
  private store: Map<string, Cost> = new Map()

  async create(cost: Cost): Promise<Cost> {
    this.store.set(cost.id, cost)
    return cost
  }

  async findById(id: string): Promise<Cost> {
    const cost = this.store.get(id)
    if (!cost) throw new NotFoundError('Cost', id)
    return cost
  }

  async findAll(): Promise<Cost[]> {
    return Array.from(this.store.values())
  }

  async findByFilter(filter: CostFilter): Promise<Cost[]> {
    let results = Array.from(this.store.values())
    if (filter.dateRange) {
      results = results.filter(
        (c) => c.date >= filter.dateRange!.from && c.date <= filter.dateRange!.to
      )
    }
    if (filter.category) {
      results = results.filter((c) => c.category === filter.category)
    }
    return results
  }

  async update(cost: Cost): Promise<Cost> {
    await this.findById(cost.id)
    this.store.set(cost.id, cost)
    return cost
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    this.store.delete(id)
  }
  async findByDateRange(from: Date, to: Date): Promise<Cost[]> {
    return Array.from(this.store.values()).filter(
      (c) => c.date >= from && c.date <= to
    )
  }
}
