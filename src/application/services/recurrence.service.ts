import type { Recurrence } from '@/src/domain/entities/recurrence'
import { RRuleSet, rrulestr } from 'rrule'

export class RecurrenceService {
  getOccurrences(
    recurrence: Recurrence,
    after?: Date,
    before?: Date,
    dtstart?: Date
  ): Date[] {
    const set = new RRuleSet()
    const ruleWithStart =
      dtstart && !recurrence.rule.includes('DTSTART')
        ? `DTSTART:${dtstart.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n${recurrence.rule}`
        : recurrence.rule
    const parsed = rrulestr(ruleWithStart)
    set.rrule(parsed as Parameters<typeof set.rrule>[0])
    if (recurrence.exceptions) {
      for (const ex of recurrence.exceptions) {
        set.exdate(ex)
      }
    }
    if (after && before) {
      return set.between(after, before, true)
    }
    return set.all((_, len) => len < 100)
  }
}
