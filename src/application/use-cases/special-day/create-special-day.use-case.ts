import { SpecialDay } from '@/src/domain/entities/special-day'
import type { ISpecialDayRepository } from '@/src/domain/repositories/special-day.interface.repository'
import type { CreateSpecialDayInput } from '@/src/domain/validations/special-day'
import { v4 as uuidv4 } from 'uuid'

export class CreateSpecialDay {
  constructor(private readonly repo: ISpecialDayRepository) {}

  async execute(input: CreateSpecialDayInput): Promise<SpecialDay> {
    const specialDay = SpecialDay.create({ id: uuidv4(), ...input })
    return this.repo.create(specialDay)
  }
}
