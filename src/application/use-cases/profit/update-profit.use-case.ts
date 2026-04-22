import type { Profit } from '@/src/domain/entities/profit'
import type { IProfitRepository } from '@/src/domain/repositories/profit.interface.repository'
import {
  UpdateProfitSchema,
  type UpdateProfitInput,
} from '@/src/domain/validations/profit'
import { NotFoundError, ValidationError } from '@/src/lib/errors'

export class UpdateProfit {
  constructor(private readonly repo: IProfitRepository) { }

  async execute(id: string, input: UpdateProfitInput): Promise<Profit> {
    const parsed = UpdateProfitSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }

    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('Profit', id)

    const data = parsed.data
    const updated: Profit = {
      id: existing.id,
      date: data.date ?? existing.date,
      amount:
        data.amount !== undefined
          ? Math.round(data.amount * 100) / 100
          : existing.amount,
      platformId: data.platformId ?? existing.platformId,
      description:
        data.description !== undefined
          ? (data.description ?? undefined)
          : existing.description,
      tags: data.tags !== undefined ? (data.tags ?? undefined) : existing.tags,
    }

    return this.repo.update(updated)
  }
}
