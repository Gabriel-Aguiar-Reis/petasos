import type { ISpecialDayRepository } from '@/src/domain/repositories/special-day.interface.repository'

export class DeleteSpecialDay {
  constructor(private readonly repo: ISpecialDayRepository) {}

  async execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
