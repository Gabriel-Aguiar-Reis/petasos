import type { Trip } from '@/src/domain/entities/trip'
import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'
import { ValidationError } from '@/src/lib/errors'
import type { DateRangeFilter, TripFilter } from '@/src/types/shared.types'

export class GetTripsByFilter {
  constructor(private readonly tripRepository: ITripRepository) { }

  async execute(filters: TripFilter): Promise<Trip[]> {
    if (filters.dateRange) {
      this.validateDateRange(filters.dateRange)
    }
    return this.tripRepository.findByFilter(filters)
  }

  private validateDateRange(range: DateRangeFilter): void {
    if (range.from > range.to) {
      throw new ValidationError('dateRange.from must be ≤ dateRange.to')
    }
  }
}
