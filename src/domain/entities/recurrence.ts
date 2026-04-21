// RFC 5545 RRULE string, e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR"
export type RecurrenceRule = string

export type Recurrence = {
  rule: RecurrenceRule
  endDate?: Date
  exceptions?: Date[]
}
