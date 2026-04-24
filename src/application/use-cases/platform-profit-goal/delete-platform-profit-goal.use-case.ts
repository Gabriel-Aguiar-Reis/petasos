import type { IPlatformProfitGoalRepository } from '@/src/domain/repositories/platform-profit-goal.interface.repository'

export class DeletePlatformProfitGoal {
  constructor(private readonly repo: IPlatformProfitGoalRepository) {}

  async execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
