import type { Cost } from '@/src/domain/entities/cost'
import type { FuelLog } from '@/src/domain/entities/fuel-log'
import type { Goal } from '@/src/domain/entities/goal'
import type { Trip } from '@/src/domain/entities/trip'
import type { WorkSession } from '@/src/domain/entities/work-session'

export type ExportEnvelope = {
  exportedAt: string // ISO 8601
  version: 1
  data: {
    trips: Trip[]
    costs: Cost[]
    fuelLogs: FuelLog[]
    workSessions: WorkSession[]
    goals: Goal[]
  }
}
