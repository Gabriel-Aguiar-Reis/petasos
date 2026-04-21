import type { IProfitRepository } from '@/src/domain/repositories/profit.interface.repository'

export class DeleteProfit {
  constructor(private readonly repo: IProfitRepository) { }

  async execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
