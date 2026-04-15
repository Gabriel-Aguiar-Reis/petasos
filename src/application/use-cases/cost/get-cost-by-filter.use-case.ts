import type { Cost } from '@/src/domain/entities/cost'
import type { ICostRepository } from '@/src/domain/repositories/cost.interface.repository'
import { ValidationError } from '@/src/lib/errors'
import type { CostFilter, DateRangeFilter } from '@/src/types/shared.types'

export class GetCostsByFilter {
  constructor(private readonly costRepository: ICostRepository) { }

  async execute(filters: CostFilter): Promise<Cost[]> {
    if (filters.dateRange) {
      this.validateDateRange(filters.dateRange)
    }
    return this.costRepository.findByFilter(filters)
  }

  private validateDateRange(range: DateRangeFilter): void {
    if (range.from > range.to) {
      throw new ValidationError('dateRange.from must be ≤ dateRange.to')
    }
  }
}
