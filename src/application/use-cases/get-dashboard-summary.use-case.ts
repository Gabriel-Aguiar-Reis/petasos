import type { ICostRepository } from '@/src/domain/repositories/cost.interface.repository'
import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'
import { ValidationError } from '@/src/lib/errors'
import type {
  DashboardSummary,
  PlatformEarnings,
} from '@/src/types/dashboard-summary.types'
import type { DateRangeFilter } from '@/src/types/shared.types'

export class GetDashboardSummary {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly costRepository: ICostRepository
  ) { }

  async execute(dateRange: DateRangeFilter): Promise<DashboardSummary> {
    if (dateRange.from > dateRange.to) {
      throw new ValidationError('dateRange.from must be ≤ dateRange.to')
    }

    const [trips, costs] = await Promise.all([
      this.tripRepository.findByFilter({ dateRange }),
      this.costRepository.findByFilter({ dateRange }),
    ])

    // Total earnings (rounded to 2dp)
    const totalEarnings =
      Math.round(trips.reduce((sum, t) => sum + t.earnings, 0) * 100) / 100

    // Total costs (rounded to 2dp)
    const totalCosts =
      Math.round(costs.reduce((sum, c) => sum + c.amount, 0) * 100) / 100

    // Net profit
    const netProfit = Math.round((totalEarnings - totalCosts) * 100) / 100

    // Earnings by platform
    const platformMap = new Map<string, number>()
    for (const trip of trips) {
      const prev = platformMap.get(trip.platform) ?? 0
      platformMap.set(trip.platform, prev + trip.earnings)
    }
    const earningsByPlatform: PlatformEarnings[] = Array.from(
      platformMap.entries()
    ).map(([platform, earnings]) => ({
      platform,
      earnings: Math.round(earnings * 100) / 100,
    }))

    // Cost per km — exclude trips with null distance
    const tripsWithDistance = trips.filter((t) => t.distance !== null)
    const totalKm = tripsWithDistance.reduce(
      (sum, t) => sum + (t.distance ?? 0),
      0
    )
    const costPerKm =
      totalKm > 0 ? Math.round((totalCosts / totalKm) * 100) / 100 : null

    return {
      dateRange,
      totalEarnings,
      totalCosts,
      netProfit,
      earningsByPlatform,
      costPerKm,
    }
  }
}
