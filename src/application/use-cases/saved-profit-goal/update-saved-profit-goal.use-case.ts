import type { SavedProfitGoal } from '@/src/domain/entities/saved-profit-goal'
import type { ISavedProfitGoalRepository } from '@/src/domain/repositories/saved-profit-goal.interface.repository'
import {
  UpdateSavedProfitGoalSchema,
  type UpdateSavedProfitGoalInput,
} from '@/src/domain/validations/saved-profit-goal'
import { NotFoundError, ValidationError } from '@/src/lib/errors'

export class UpdateSavedProfitGoal {
  constructor(private readonly repo: ISavedProfitGoalRepository) {}

  async execute(
    id: string,
    input: UpdateSavedProfitGoalInput
  ): Promise<SavedProfitGoal> {
    const parsed = UpdateSavedProfitGoalSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }

    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('SavedProfitGoal', id)

    const data = parsed.data
    const updated: SavedProfitGoal = {
      id: existing.id,
      name: data.name ?? existing.name,
      targetAmount:
        data.targetAmount !== undefined
          ? Math.round(data.targetAmount * 100) / 100
          : existing.targetAmount,
      period:
        data.period !== undefined ? (data.period ?? undefined) : existing.period,
      tags: data.tags !== undefined ? (data.tags ?? undefined) : existing.tags,
      notes:
        data.notes !== undefined ? (data.notes ?? undefined) : existing.notes,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    }

    return this.repo.update(updated)
  }
}
