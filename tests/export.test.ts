import { CreateCost } from '@/src/application/use-cases/cost/create-cost.use-case'
import { ExportDataAsJSON } from '@/src/application/use-cases/export-data-as-json.use-case'
import { CreateFuelLog } from '@/src/application/use-cases/fuel-log/create-fuel-log.use-case'
import { CreateGoal } from '@/src/application/use-cases/goal/create-goal.use-case'
import { CreateTrip } from '@/src/application/use-cases/trip/create-trip.use-case'
import { StartWorkSession } from '@/src/application/use-cases/work-session/star-work-session.use-case'
import { InMemoryCostRepository } from '@/tests/fakes/InMemoryCostRepository'
import { InMemoryFuelLogRepository } from '@/tests/fakes/InMemoryFuelLogRepository'
import { InMemoryGoalRepository } from '@/tests/fakes/InMemoryGoalRepository'
import { InMemoryTripRepository } from '@/tests/fakes/InMemoryTripRepository'
import { InMemoryWorkSessionRepository } from '@/tests/fakes/InMemoryWorkSessionRepository'

describe('ExportDataAsJSON', () => {
  let tripRepo: InMemoryTripRepository
  let costRepo: InMemoryCostRepository
  let fuelLogRepo: InMemoryFuelLogRepository
  let workSessionRepo: InMemoryWorkSessionRepository
  let goalRepo: InMemoryGoalRepository

  beforeEach(() => {
    tripRepo = new InMemoryTripRepository()
    costRepo = new InMemoryCostRepository()
    fuelLogRepo = new InMemoryFuelLogRepository()
    workSessionRepo = new InMemoryWorkSessionRepository()
    goalRepo = new InMemoryGoalRepository()
  })

  it('returns empty arrays when no data exists', async () => {
    const uc = new ExportDataAsJSON(
      tripRepo,
      costRepo,
      fuelLogRepo,
      workSessionRepo,
      goalRepo
    )
    const envelope = await uc.execute()
    expect(envelope.data.trips).toHaveLength(0)
    expect(envelope.data.costs).toHaveLength(0)
    expect(envelope.data.fuelLogs).toHaveLength(0)
    expect(envelope.data.workSessions).toHaveLength(0)
    expect(envelope.data.goals).toHaveLength(0)
    expect(typeof envelope.exportedAt).toBe('string')
    expect(envelope.version).toBe(1)
  })

  it('includes all entities in the export', async () => {
    await new CreateTrip(tripRepo).execute({ earnings: 50, platform: 'Uber' })
    await new CreateCost(costRepo).execute({ amount: 20, category: 'fuel' })
    await new CreateFuelLog(fuelLogRepo).execute({
      fuelType: 'Gasolina',
      liters: 40,
      totalPrice: 240,
      odometer: 10000,
    })
    await new StartWorkSession(workSessionRepo).execute()
    await new CreateGoal(goalRepo).execute({
      type: 'daily',
      targetAmount: 100,
      periodStart: new Date(),
    })

    const uc = new ExportDataAsJSON(
      tripRepo,
      costRepo,
      fuelLogRepo,
      workSessionRepo,
      goalRepo
    )
    const envelope = await uc.execute()
    expect(envelope.data.trips).toHaveLength(1)
    expect(envelope.data.costs).toHaveLength(1)
    expect(envelope.data.fuelLogs).toHaveLength(1)
    expect(envelope.data.workSessions).toHaveLength(1)
    expect(envelope.data.goals).toHaveLength(1)
  })
})
