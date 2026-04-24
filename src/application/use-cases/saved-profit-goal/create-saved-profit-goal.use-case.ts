import type { SavedProfitGoal } from '@/src/domain/entities/saved-profit-goal'
import type { ISavedProfitGoalRepository } from '@/src/domain/repositories/saved-profit-goal.interface.repository'
import {
  CreateSavedProfitGoalSchema,
  type CreateSavedProfitGoalInput,
} from '@/src/domain/validations/saved-profit-goal'
import { ValidationError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

export class CreateSavedProfitGoal {
  constructor(private readonly repo: ISavedProfitGoalRepository) {}

  async execute(input: CreateSavedProfitGoalInput): Promise<SavedProfitGoal> {
    const parsed = CreateSavedProfitGoalSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    const now = new Date()
    const goal: SavedProfitGoal = {
      id: uuidv4(),
      name: parsed.data.name,
      targetAmount: Math.round(parsed.data.targetAmount * 100) / 100,
      period: parsed.data.period,
      tags: parsed.data.tags,
      notes: parsed.data.notes,
      createdAt: now,
      updatedAt: now,
    }
    return this.repo.create(goal)
  }
}
