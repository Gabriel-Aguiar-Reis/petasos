import { CreateCost } from '@/src/application/use-cases/cost/create-cost.use-case'
import { GetDashboardSummary } from '@/src/application/use-cases/get-dashboard-summary.use-case'
import { CreateTrip } from '@/src/application/use-cases/trip/create-trip.use-case'
import { ValidationError } from '@/src/lib/errors'
import { InMemoryCostRepository } from '@/tests/fakes/InMemoryCostRepository'
import { InMemoryTripRepository } from '@/tests/fakes/InMemoryTripRepository'

describe('GetDashboardSummary', () => {
  let tripRepo: InMemoryTripRepository
  let costRepo: InMemoryCostRepository

  beforeEach(() => {
    tripRepo = new InMemoryTripRepository()
    costRepo = new InMemoryCostRepository()
  })

  it('returns zero values when no data exists', async () => {
    const uc = new GetDashboardSummary(tripRepo, costRepo)
    const summary = await uc.execute({
      from: new Date(2024, 0, 1),
      to: new Date(2024, 0, 31),
    })
    expect(summary.totalEarnings).toBe(0)
    expect(summary.totalCosts).toBe(0)
    expect(summary.netProfit).toBe(0)
    expect(summary.earningsByPlatform).toHaveLength(0)
    expect(summary.costPerKm).toBeNull()
  })

  it('computes summary correctly with trips and costs', async () => {
    const date = new Date(2024, 0, 15)
    await new CreateTrip(tripRepo).execute({
      earnings: 50,
      platform: 'Uber',
      distance: 10,
      date,
    })
    await new CreateTrip(tripRepo).execute({
      earnings: 30,
      platform: '99',
      distance: 5,
      date,
    })
    await new CreateCost(costRepo).execute({
      amount: 20,
      category: 'fuel',
      date,
    })

    const uc = new GetDashboardSummary(tripRepo, costRepo)
    const summary = await uc.execute({
      from: new Date(2024, 0, 1),
      to: new Date(2024, 0, 31),
    })

    expect(summary.totalEarnings).toBe(80)
    expect(summary.totalCosts).toBe(20)
    expect(summary.netProfit).toBe(60)
    // costPerKm = 20 / 15km
    expect(summary.costPerKm).toBe(Math.round((20 / 15) * 100) / 100)

    const uber = summary.earningsByPlatform.find((p) => p.platform === 'Uber')
    expect(uber?.earnings).toBe(50)
    const p99 = summary.earningsByPlatform.find((p) => p.platform === '99')
    expect(p99?.earnings).toBe(30)
  })

  it('costPerKm is null when all trips have null distance', async () => {
    const date = new Date(2024, 0, 15)
    await new CreateTrip(tripRepo).execute({
      earnings: 50,
      platform: 'Uber',
      date,
    }) // distance null
    await new CreateCost(costRepo).execute({
      amount: 20,
      category: 'fuel',
      date,
    })

    const uc = new GetDashboardSummary(tripRepo, costRepo)
    const summary = await uc.execute({
      from: new Date(2024, 0, 1),
      to: new Date(2024, 0, 31),
    })
    expect(summary.costPerKm).toBeNull()
  })

  it('earningsByPlatform accumulates multiple trips on the same platform', async () => {
    const date = new Date(2024, 0, 15)
    await new CreateTrip(tripRepo).execute({
      earnings: 50,
      platform: 'Uber',
      date,
    })
    await new CreateTrip(tripRepo).execute({
      earnings: 30,
      platform: 'Uber',
      date,
    })

    const summary = await new GetDashboardSummary(tripRepo, costRepo).execute({
      from: new Date(2024, 0, 1),
      to: new Date(2024, 0, 31),
    })
    const uber = summary.earningsByPlatform.find((p) => p.platform === 'Uber')
    expect(uber?.earnings).toBe(80)
  })

  it('throws ValidationError when from > to', async () => {
    const uc = new GetDashboardSummary(tripRepo, costRepo)
    await expect(
      uc.execute({ from: new Date(2024, 1, 1), to: new Date(2024, 0, 1) })
    ).rejects.toBeInstanceOf(ValidationError)
  })
})
