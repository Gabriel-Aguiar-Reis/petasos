import type { ICostRepository } from '@/src/domain/repositories/cost.interface.repository'

export class DeleteCost {
  constructor(private readonly costRepository: ICostRepository) {}

  async execute(id: string): Promise<void> {
    await this.costRepository.findById(id)
    await this.costRepository.delete(id)
  }
}
