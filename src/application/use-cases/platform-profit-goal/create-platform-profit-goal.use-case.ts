import type { PlatformProfitGoal } from '@/src/domain/entities/platform-profit-goal'
import type { IPlatformProfitGoalRepository } from '@/src/domain/repositories/platform-profit-goal.interface.repository'
import {
  CreatePlatformProfitGoalSchema,
  type CreatePlatformProfitGoalInput,
} from '@/src/domain/validations/platform-profit-goal'
import { ValidationError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

export class CreatePlatformProfitGoal {
  constructor(private readonly repo: IPlatformProfitGoalRepository) { }

  async execute(
    input: CreatePlatformProfitGoalInput
  ): Promise<PlatformProfitGoal> {
    const parsed = CreatePlatformProfitGoalSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    const now = new Date()
    const goal: PlatformProfitGoal = {
      id: uuidv4(),
      platformId: parsed.data.platformId,
      targetAmount: Math.round(parsed.data.targetAmount * 100) / 100,
      tags: parsed.data.tags,
      notes: parsed.data.notes,
      createdAt: now,
      updatedAt: now,
    }
    return this.repo.create(goal)
  }
}
