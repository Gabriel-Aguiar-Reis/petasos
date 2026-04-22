import type { Profit } from '@/src/domain/entities/profit'
import type { IProfitRepository } from '@/src/domain/repositories/profit.interface.repository'
import {
  CreateProfitSchema,
  type CreateProfitInput,
} from '@/src/domain/validations/profit'
import { ValidationError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

export class CreateProfit {
  constructor(private readonly repo: IProfitRepository) { }

  async execute(input: CreateProfitInput): Promise<Profit> {
    const parsed = CreateProfitSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    const profit: Profit = {
      id: uuidv4(),
      date: parsed.data.date ?? new Date(),
      amount: Math.round(parsed.data.amount * 100) / 100,
      platformId: parsed.data.platformId,
      description: parsed.data.description,
      tags: parsed.data.tags,
    }
    return this.repo.create(profit)
  }
}
