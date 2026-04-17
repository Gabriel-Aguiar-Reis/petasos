import { Period } from '@/src/types/dashboard-summary.types'

export function getDateRange(period: Period): { from: Date; to: Date } {
  const now = new Date()
  const from = new Date(now)
  const to = new Date(now)

  if (period === 'today') {
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else if (period === 'week') {
    const day = now.getDay()
    from.setDate(now.getDate() - day)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else {
    from.setDate(1)
    from.setHours(0, 0, 0, 0)
    to.setMonth(to.getMonth() + 1, 0)
    to.setHours(23, 59, 59, 999)
  }

  return { from, to }
}
