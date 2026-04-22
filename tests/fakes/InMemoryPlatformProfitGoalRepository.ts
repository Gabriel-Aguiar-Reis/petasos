import type { PlatformProfitGoal } from '@/src/domain/entities/platform-profit-goal'
import type { IPlatformProfitGoalRepository } from '@/src/domain/repositories/platform-profit-goal.interface.repository'

export class InMemoryPlatformProfitGoalRepository implements IPlatformProfitGoalRepository {
  private store: Map<string, PlatformProfitGoal> = new Map()

  async create(goal: PlatformProfitGoal): Promise<PlatformProfitGoal> {
    this.store.set(goal.id, goal)
    return goal
  }

  async findById(id: string): Promise<PlatformProfitGoal | null> {
    return this.store.get(id) ?? null
  }

  async findByPlatform(platformId: string): Promise<PlatformProfitGoal[]> {
    return Array.from(this.store.values()).filter(
      (g) => g.platformId === platformId
    )
  }

  async update(goal: PlatformProfitGoal): Promise<PlatformProfitGoal> {
    this.store.set(goal.id, goal)
    return goal
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
