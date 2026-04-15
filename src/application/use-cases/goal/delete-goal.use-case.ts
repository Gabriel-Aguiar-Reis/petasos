import type { IGoalRepository } from '@/src/domain/repositories/goal.interface.repository'

export class DeleteGoal {
  constructor(private readonly goalRepository: IGoalRepository) {}

  async execute(id: string): Promise<void> {
    await this.goalRepository.findById(id)
    await this.goalRepository.delete(id)
  }
}
