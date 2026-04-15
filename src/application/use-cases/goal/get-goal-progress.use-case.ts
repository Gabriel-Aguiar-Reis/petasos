import type { Goal } from '@/src/domain/entities/goal'
import type { IGoalRepository } from '@/src/domain/repositories/goal.interface.repository'
import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'
import type { DateRangeFilter } from '@/src/types/shared.types'

export type GoalProgress = {
  goal: Goal
  periodRange: DateRangeFilter
  actualEarnings: number
  remainingAmount: number
  achieved: boolean
}

export class GetGoalProgress {
  constructor(
    private readonly goalRepository: IGoalRepository,
    private readonly tripRepository: ITripRepository
  ) {}

  async execute(): Promise<GoalProgress[]> {
    const allGoals = await this.goalRepository.findAll()
    const results: GoalProgress[] = []

    for (const goal of allGoals) {
      // Use Goal entity's computed periodEnd getter
      const periodRange: DateRangeFilter = {
        from: goal.periodStart,
        to: goal.periodEnd,
      }
      const trips = await this.tripRepository.findByFilter({
        dateRange: periodRange,
      })
      const actualEarnings =
        Math.round(trips.reduce((sum, t) => sum + t.earnings, 0) * 100) / 100

      results.push({
        goal,
        periodRange,
        actualEarnings,
        // Delegate to entity behaviour methods
        remainingAmount: goal.remainingAmount(actualEarnings),
        achieved: goal.isAchieved(actualEarnings),
      })
    }

    return results
  }
}
