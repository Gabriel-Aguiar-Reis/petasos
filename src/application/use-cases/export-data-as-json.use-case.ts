import type { ICostRepository } from '@/src/domain/repositories/cost.interface.repository'
import type { IFuelLogRepository } from '@/src/domain/repositories/fuel-log.interface.repository'
import type { IGoalRepository } from '@/src/domain/repositories/goal.interface.repository'
import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'
import type { IWorkSessionRepository } from '@/src/domain/repositories/work-session.interface.repository'
import type { ExportEnvelope } from '@/src/types/export-envelope.types'

export class ExportDataAsJSON {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly costRepository: ICostRepository,
    private readonly fuelLogRepository: IFuelLogRepository,
    private readonly workSessionRepository: IWorkSessionRepository,
    private readonly goalRepository: IGoalRepository
  ) {}

  async execute(): Promise<ExportEnvelope> {
    const [trips, costs, fuelLogs, workSessions, goals] = await Promise.all([
      this.tripRepository.findAll(),
      this.costRepository.findAll(),
      this.fuelLogRepository.findAll(),
      this.workSessionRepository.findAll(),
      this.goalRepository.findAll(),
    ])

    return {
      exportedAt: new Date().toISOString(),
      version: 1,
      data: {
        trips,
        costs,
        fuelLogs,
        workSessions,
        goals,
      },
    }
  }
}
