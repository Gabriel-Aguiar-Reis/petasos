import type { Cost } from '@/src/domain/entities/cost'
import type { CostFilter } from '@/src/types/shared.types'

export interface ICostRepository {
  create(cost: Cost): Promise<Cost>
  findById(id: string): Promise<Cost>
  findAll(): Promise<Cost[]>
  findByFilter(filters: CostFilter): Promise<Cost[]>
  findByDateRange(from: Date, to: Date): Promise<Cost[]>
  update(cost: Cost): Promise<Cost>
  delete(id: string): Promise<void>
}
