import type { SavedProfitGoal } from '../entities/saved-profit-goal'

export interface ISavedProfitGoalRepository {
  create(goal: SavedProfitGoal): Promise<SavedProfitGoal>
  findById(id: string): Promise<SavedProfitGoal | null>
  findAll(): Promise<SavedProfitGoal[]>
  update(goal: SavedProfitGoal): Promise<SavedProfitGoal>
  delete(id: string): Promise<void>
}
