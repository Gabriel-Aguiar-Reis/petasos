import type { PlatformProfitGoal } from '@/src/domain/entities/platform-profit-goal'
import type { IPlatformProfitGoalRepository } from '@/src/domain/repositories/platform-profit-goal.interface.repository'
import {
  UpdatePlatformProfitGoalSchema,
  type UpdatePlatformProfitGoalInput,
} from '@/src/domain/validations/platform-profit-goal'
import { NotFoundError, ValidationError } from '@/src/lib/errors'

export class UpdatePlatformProfitGoal {
  constructor(private readonly repo: IPlatformProfitGoalRepository) {}

  async execute(
    id: string,
    input: UpdatePlatformProfitGoalInput
  ): Promise<PlatformProfitGoal> {
    const parsed = UpdatePlatformProfitGoalSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }

    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('PlatformProfitGoal', id)

    const data = parsed.data
    const updated: PlatformProfitGoal = {
      id: existing.id,
      platformId: existing.platformId,
      targetAmount:
        data.targetAmount !== undefined
          ? Math.round(data.targetAmount * 100) / 100
          : existing.targetAmount,
      tags: data.tags !== undefined ? (data.tags ?? undefined) : existing.tags,
      notes:
        data.notes !== undefined ? (data.notes ?? undefined) : existing.notes,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    }

    return this.repo.update(updated)
  }
}
