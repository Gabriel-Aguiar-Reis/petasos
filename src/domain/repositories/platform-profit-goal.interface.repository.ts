import type { PlatformProfitGoal } from '@/src/domain/entities/platform-profit-goal'

export interface IPlatformProfitGoalRepository {
  create(goal: PlatformProfitGoal): Promise<PlatformProfitGoal>
  findById(id: string): Promise<PlatformProfitGoal | null>
  findByPlatform(platformId: string): Promise<PlatformProfitGoal[]>
  update(goal: PlatformProfitGoal): Promise<PlatformProfitGoal>
  delete(id: string): Promise<void>
}
