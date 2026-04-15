import { Goal } from '@/src/domain/entities/goal'
import type { IGoalRepository } from '@/src/domain/repositories/goal.interface.repository'
import type { CreateGoalInput } from '@/src/domain/validations/goal'
import { v4 as uuidv4 } from 'uuid'

export class CreateGoal {
  constructor(private readonly goalRepository: IGoalRepository) {}

  async execute(input: CreateGoalInput): Promise<Goal> {
    const goal = Goal.create({ id: uuidv4(), ...input })
    return this.goalRepository.create(goal)
  }
}
