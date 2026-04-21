import { SpecialDay } from '@/src/domain/entities/special-day'
import type { ISpecialDayRepository } from '@/src/domain/repositories/special-day.interface.repository'
import { StorageError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

type BrasilApiHoliday = {
  date: string
  name: string
  type: string
}

export type HolidaySyncResult = {
  synced: number
  skipped: number
}

export class HolidaySyncService {
  constructor(private readonly specialDayRepo: ISpecialDayRepository) { }

  async syncYear(year: number): Promise<HolidaySyncResult> {
    let holidays: BrasilApiHoliday[] = []
    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/feriados/v1/${year}`
      )
      if (!response.ok) return { synced: 0, skipped: 0 }
      holidays = (await response.json()) as BrasilApiHoliday[]
    } catch {
      // Network error — fail silently
      return { synced: 0, skipped: 0 }
    }

    let synced = 0
    let skipped = 0

    for (const h of holidays) {
      try {
        const specialDay = SpecialDay.reconstitute({
          id: uuidv4(),
          date: new Date(h.date),
          description: h.name,
          source: 'official',
          type: h.type,
        })
        await this.specialDayRepo.upsertOfficial(specialDay)
        synced++
      } catch (err) {
        if (err instanceof StorageError) {
          skipped++
        } else {
          throw err
        }
      }
    }

    return { synced, skipped }
  }
}
