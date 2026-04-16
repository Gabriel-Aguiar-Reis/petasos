import { GetDashboardSummary } from '@/src/application/use-cases/get-dashboard-summary.use-case'
import { db } from '@/src/infra/db/client'
import { DrizzleCostRepository } from '@/src/infra/repositories/cost.drizzle-repository'
import { DrizzleTripRepository } from '@/src/infra/repositories/trip.drizzle-repository'
import type { DateRangeFilter } from '@/src/types/shared.types'
import { useQuery } from '@tanstack/react-query'

const tripRepo = new DrizzleTripRepository(db)
const costRepo = new DrizzleCostRepository(db)
const useCase = new GetDashboardSummary(tripRepo, costRepo)

export function useDashboardSummary(dateRange: DateRangeFilter) {
  return useQuery({
    queryKey: ['dashboard', dateRange],
    queryFn: () => useCase.execute(dateRange),
  })
}
