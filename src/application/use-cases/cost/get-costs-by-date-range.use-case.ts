import type { RecurrenceService } from '@/src/application/services/recurrence.service'
import { Cost } from '@/src/domain/entities/cost'
import type { ICostRepository } from '@/src/domain/repositories/cost.interface.repository'

export class GetCostsByDateRange {
  constructor(
    private readonly costRepository: ICostRepository,
    private readonly recurrenceService: RecurrenceService
  ) {}

  async execute(from: Date, to: Date): Promise<Cost[]> {
    const stored = await this.costRepository.findByDateRange(from, to)

    // Also fetch recurring costs that started before `from`
    const allCosts = await this.costRepository.findAll()
    const recurringOutside = allCosts.filter(
      (c) => c.recurrence != null && c.date < from
    )

    const expanded: Cost[] = [...stored]

    for (const cost of recurringOutside) {
      if (!cost.recurrence) continue
      const occurrences = this.recurrenceService.getOccurrences(
        cost.recurrence,
        from,
        to,
        cost.date
      )
      for (const date of occurrences) {
        // Create a virtual (in-memory) cost with the occurrence date
        expanded.push(
          Cost.reconstitute({
            id: cost.id,
            date,
            amount: cost.amount,
            category: cost.category,
            description: cost.description,
            recurrence: cost.recurrence,
            tags: cost.tags,
          })
        )
      }
    }

    return expanded.sort((a, b) => a.date.getTime() - b.date.getTime())
  }
}
