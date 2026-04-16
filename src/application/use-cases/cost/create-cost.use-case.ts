import { Cost } from '@/src/domain/entities/cost'
import type { ICostRepository } from '@/src/domain/repositories/cost.interface.repository'
import type { CreateCostInput } from '@/src/domain/validations/cost'
import { v4 as uuidv4 } from 'uuid'

export class CreateCost {
  constructor(private readonly costRepository: ICostRepository) {}

  async execute(input: CreateCostInput): Promise<Cost> {
    const cost = Cost.create({ id: uuidv4(), ...input })
    return this.costRepository.create(cost)
  }
}
