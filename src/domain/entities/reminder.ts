import { ValidationError } from '@/src/lib/errors'
import {
  CreateReminderSchema,
  UpdateReminderSchema,
  type CreateReminderInput,
  type UpdateReminderInput,
} from '../validations/reminder'
import type { Recurrence } from './recurrence'

export type ReminderProps = {
  id: string
  message: string
  date: Date
  alarm: boolean
  recurrence?: Recurrence
  notes?: string
}

export class Reminder {
  readonly id: string
  readonly message: string
  readonly date: Date
  readonly alarm: boolean
  readonly recurrence?: Recurrence
  readonly notes?: string

  private constructor(props: ReminderProps) {
    this.id = props.id
    this.message = props.message
    this.date = props.date
    this.alarm = props.alarm
    this.recurrence = props.recurrence
    this.notes = props.notes
  }

  static create(input: CreateReminderInput & { id: string }): Reminder {
    const parsed = CreateReminderSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    return new Reminder({
      id: input.id,
      message: parsed.data.message,
      date: parsed.data.date,
      alarm: parsed.data.alarm,
      recurrence: parsed.data.recurrence,
      notes: parsed.data.notes,
    })
  }

  static reconstitute(props: ReminderProps): Reminder {
    return new Reminder(props)
  }

  update(input: UpdateReminderInput): Reminder {
    const parsed = UpdateReminderSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    return new Reminder({
      id: this.id,
      message: input.message !== undefined ? input.message : this.message,
      date: input.date !== undefined ? input.date : this.date,
      alarm: input.alarm !== undefined ? input.alarm : this.alarm,
      recurrence:
        input.recurrence !== undefined
          ? (input.recurrence ?? undefined)
          : this.recurrence,
      notes: input.notes !== undefined ? (input.notes ?? undefined) : this.notes,
    })
  }
}
