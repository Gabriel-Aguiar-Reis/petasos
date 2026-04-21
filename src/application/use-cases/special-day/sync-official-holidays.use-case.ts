import {
  HolidaySyncService,
  type HolidaySyncResult,
} from '@/src/application/services/holiday-sync.service'
import type { ISpecialDayRepository } from '@/src/domain/repositories/special-day.interface.repository'

export class SyncOfficialHolidays {
  private readonly syncService: HolidaySyncService

  constructor(private readonly repo: ISpecialDayRepository) {
    this.syncService = new HolidaySyncService(repo)
  }

  async execute(year: number): Promise<HolidaySyncResult> {
    return this.syncService.syncYear(year)
  }
}
