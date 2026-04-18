import type { DateRangeFilter } from '@/src/types/shared.types'

export type PlatformEarnings = {
  platform: string
  earnings: number
}

export type DashboardSummary = {
  dateRange: DateRangeFilter
  totalEarnings: number
  totalCosts: number
  netProfit: number // totalEarnings − totalCosts
  earningsByPlatform: PlatformEarnings[]
  costPerKm: number | null // null if no trips with distance
}

export type Period = 'today' | 'week' | 'month'
