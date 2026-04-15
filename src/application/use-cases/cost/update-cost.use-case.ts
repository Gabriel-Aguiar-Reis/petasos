import type { Cost } from '@/src/domain/entities/cost'
import type { ICostRepository } from '@/src/domain/repositories/cost.interface.repository'
import type { UpdateCostInput } from '@/src/domain/validations/cost'

export class UpdateCost {
  constructor(private readonly costRepository: ICostRepository) {}

  async execute(id: string, input: UpdateCostInput): Promise<Cost> {
    const existing = await this.costRepository.findById(id)
    const updated = existing.update(input)
    return this.costRepository.update(updated)
  }
}
