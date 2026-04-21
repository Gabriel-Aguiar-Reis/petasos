import { RecurrenceService } from '@/src/application/services/recurrence.service'

describe('RecurrenceService', () => {
  it('returns occurrences for simple rule with dtstart', () => {
    const svc = new RecurrenceService()
    const r = { rule: 'FREQ=DAILY;COUNT=2' }
    const dt = new Date('2023-01-01T00:00:00Z')
    const occ = svc.getOccurrences(r as any, undefined, undefined, dt)
    expect(occ.length).toBe(2)
    expect(occ[0].toISOString().startsWith('2023-01-01')).toBeTruthy()
  })

  it('applies exceptions and between filter', () => {
    const svc = new RecurrenceService()
    const dt = new Date('2023-01-01T00:00:00Z')
    const r = { rule: 'FREQ=DAILY;COUNT=3', exceptions: [new Date('2023-01-02T00:00:00Z')] }
    const after = new Date('2023-01-01T00:00:00Z')
    const before = new Date('2023-01-04T00:00:00Z')
    const occ = svc.getOccurrences(r as any, after, before, dt)
    // original would be 3 days, with one exception -> 2
    expect(occ.length).toBe(2)
    expect(occ.find(d => d.toISOString().startsWith('2023-01-02'))).toBeUndefined()
  })
})
