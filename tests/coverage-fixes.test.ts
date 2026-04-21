import { Cost } from '@/src/domain/entities/cost'
import { calculateAverageConsumption } from '@/src/domain/entities/fuel-consumption-record'
import { Maintenance } from '@/src/domain/entities/maintenance'
import { PlannedAbsence } from '@/src/domain/entities/planned-absence'
import { calculateProfit } from '@/src/domain/entities/profit-calculator'
import { ValidationError } from '@/src/lib/errors'

describe('Coverage fixes for edge branches', () => {
  it('Cost.update removes optional fields when null is provided', () => {
    const cost = Cost.reconstitute({
      id: 'c1',
      date: new Date(),
      amount: 100,
      category: 'fuel',
      description: 'desc',
      recurrence: { rule: 'FREQ=DAILY;COUNT=1' } as any,
      tags: ['a'],
    })

    const updated = cost.update({
      description: null,
      recurrence: null,
      tags: null,
    } as unknown as Parameters<typeof cost.update>[0])

    expect(updated.description).toBeUndefined()
    expect(updated.recurrence).toBeUndefined()
    expect(updated.tags).toBeUndefined()
  })

  it('calculateAverageConsumption throws when effective fuel calculated from gauge <= 0', () => {
    expect(() =>
      calculateAverageConsumption({
        startMileage: 0,
        endMileage: 100,
        fuelAdded: 1,
        // large negative gauge delta to force effectiveFuel <= 0
        fuelGaugeMeasurement: { before: 100, after: 0 },
        fuelGaugeTotalCapacity: 1,
      })
    ).toThrow()
  })

  it('calculateProfit throws when averageConsumption <= 0', () => {
    expect(() =>
      calculateProfit({
        distance: 10,
        averageConsumption: 0,
        fuelPrice: 5,
        profitTarget: { type: 'amount', value: 20 },
      })
    ).toThrow(ValidationError)
  })

  it('Maintenance.reconstitute and update preserves completedAt when not provided', () => {
    const completed = new Date('2025-06-01')
    const m = Maintenance.reconstitute({
      id: 'm1',
      vehicleId: 'v1',
      title: 'Tune up',
      estimatedCost: 50,
      trigger: { type: 'date', date: new Date('2025-01-01') },
      completedAt: completed,
      notes: 'keep',
    })

    const updated = m.update({})
    expect(updated.completedAt).toEqual(completed)
  })

  it('Maintenance.update removes notes when null', () => {
    const m = Maintenance.reconstitute({
      id: 'm2',
      vehicleId: 'v1',
      title: 'Check',
      estimatedCost: 20,
      trigger: { type: 'date', date: new Date('2025-01-01') },
      notes: 'n',
    })
    const updated = m.update({ notes: null })
    expect(updated.notes).toBeUndefined()
  })

  it('PlannedAbsence.update removes notes when null', () => {
    const p = PlannedAbsence.reconstitute({
      id: 'p1',
      type: 'day_off',
      date: new Date('2025-07-04'),
      notes: 'n',
    })
    const updated = p.update({ notes: null })
    expect(updated.notes).toBeUndefined()
  })
})
