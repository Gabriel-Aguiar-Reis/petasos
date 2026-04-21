import type { SavedProfitGoal } from '@/src/domain/entities/saved-profit-goal'
import type { ISavedProfitGoalRepository } from '@/src/domain/repositories/saved-profit-goal.interface.repository'

export class InMemorySavedProfitGoalRepository implements ISavedProfitGoalRepository {
  private store: Map<string, SavedProfitGoal> = new Map()

  async create(goal: SavedProfitGoal): Promise<SavedProfitGoal> {
    this.store.set(goal.id, goal)
    return goal
  }

  async findById(id: string): Promise<SavedProfitGoal | null> {
    return this.store.get(id) ?? null
  }

  async findAll(): Promise<SavedProfitGoal[]> {
    return Array.from(this.store.values())
  }

  async update(goal: SavedProfitGoal): Promise<SavedProfitGoal> {
    this.store.set(goal.id, goal)
    return goal
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
