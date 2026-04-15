import type { Goal, GoalType } from '@/src/domain/entities/goal'

export interface IGoalRepository {
  create(goal: Goal): Promise<Goal>
  findById(id: string): Promise<Goal>
  findAll(): Promise<Goal[]>
  findByType(type: GoalType): Promise<Goal[]>
  update(goal: Goal): Promise<Goal>
  delete(id: string): Promise<void>
}
