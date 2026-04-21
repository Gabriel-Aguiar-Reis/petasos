import type { ISavedProfitGoalRepository } from '@/src/domain/repositories/saved-profit-goal.interface.repository'

export class DeleteSavedProfitGoal {
  constructor(private readonly repo: ISavedProfitGoalRepository) { }

  async execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
