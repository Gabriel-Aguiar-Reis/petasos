import type { GoalType } from '@/src/domain/entities/goal'
import { Goal } from '@/src/domain/entities/goal'
import type { IGoalRepository } from '@/src/domain/repositories/goal.interface.repository'
import { NotFoundError } from '@/src/lib/errors'

export class InMemoryGoalRepository implements IGoalRepository {
  private store: Map<string, Goal> = new Map()

  async create(goal: Goal): Promise<Goal> {
    this.store.set(goal.id, goal)
    return goal
  }

  async findById(id: string): Promise<Goal> {
    const goal = this.store.get(id)
    if (!goal) throw new NotFoundError('Goal', id)
    return goal
  }

  async findAll(): Promise<Goal[]> {
    return Array.from(this.store.values())
  }

  async findByType(type: GoalType): Promise<Goal[]> {
    return Array.from(this.store.values()).filter((g) => g.type === type)
  }

  async update(goal: Goal): Promise<Goal> {
    await this.findById(goal.id)
    this.store.set(goal.id, goal)
    return goal
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    this.store.delete(id)
  }
}
