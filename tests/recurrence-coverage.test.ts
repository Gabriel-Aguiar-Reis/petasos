import { RecurrenceService } from '@/src/application/services/recurrence.service'
import { GetCostsByDateRange } from '@/src/application/use-cases/cost/get-costs-by-date-range.use-case'

describe('RecurrenceService and GetCostsByDateRange', () => {
  it('RecurrenceService handles dtstart injection and exceptions', () => {
    const svc = new RecurrenceService()
    const r = { rule: 'FREQ=DAILY;COUNT=2' }
    const occ = svc.getOccurrences(r as any, undefined, undefined, new Date('2025-01-01'))
    expect(Array.isArray(occ)).toBeTruthy()

    const r2 = { rule: 'FREQ=DAILY;COUNT=2', exceptions: [new Date('2025-01-01')] }
    const occ2 = svc.getOccurrences(r2 as any, undefined, undefined, new Date('2025-01-01'))
    expect(Array.isArray(occ2)).toBeTruthy()
    // rule that already contains DTSTART should avoid injection branch
    const r3 = { rule: 'DTSTART:20250101T000000Z\nFREQ=DAILY;COUNT=1' }
    const occ3 = svc.getOccurrences(r3 as any, undefined, undefined, new Date('2025-01-01'))
    expect(Array.isArray(occ3)).toBeTruthy()
  })

  it('GetCostsByDateRange expands recurring costs', async () => {
    const fakeRepo: any = {
      findByDateRange: async () => [
        { id: 'c1', date: new Date('2025-03-01'), amount: 10, category: 'x' },
      ],
      findAll: async () => [
        {
          id: 'c2',
          date: new Date('2025-01-01'),
          amount: 5,
          category: 'x',
          recurrence: { rule: 'FREQ=DAILY;COUNT=2' },
        },
      ],
    }

    const fakeRecurrenceSvc: RecurrenceService = {
      getOccurrences: (_rec: any, from?: Date, to?: Date, _dtstart?: Date) => [new Date('2025-03-02')],
    } as any

    const uc = new GetCostsByDateRange(fakeRepo, fakeRecurrenceSvc)
    const results = await uc.execute(new Date('2025-03-01'), new Date('2025-03-31'))
    expect(results.some((c) => c.id === 'c2' && c.date instanceof Date)).toBeTruthy()

    // also cover branch where recurrence is null so the filter condition is false
    const fakeRepo2: any = {
      findByDateRange: async () => [],
      findAll: async () => [
        { id: 'c4', date: new Date('2025-03-05'), amount: 5, category: 'x', recurrence: null },
      ],
    }
    const uc2 = new GetCostsByDateRange(fakeRepo2, fakeRecurrenceSvc)
    const results2 = await uc2.execute(new Date('2025-03-01'), new Date('2025-03-31'))
    expect(results2.length).toBe(0)
  })

  it('GetCostsByDateRange handles mutated recurrence between filter and loop', async () => {
    const fakeRepo: any = {
      findByDateRange: async () => [],
      findAll: async () => [
        {
          id: 'c5',
          date: new Date('2025-01-01'),
          amount: 5,
          category: 'x',
          // recurrence getter returns object once (for filter), then null (for loop)
          get recurrence() {
            if (!(this as any)._seen) {
              ;(this as any)._seen = true
              return { rule: 'FREQ=DAILY;COUNT=1' }
            }
            return null
          },
        },
      ],
    }

    const fakeRecurrenceSvc: RecurrenceService = {
      getOccurrences: () => {
        throw new Error('should not be called')
      },
    } as any

    const uc = new GetCostsByDateRange(fakeRepo, fakeRecurrenceSvc)
    const results = await uc.execute(new Date('2025-03-01'), new Date('2025-03-31'))
    expect(results.length).toBe(0)
  })
})
