import {
  CreatePlannedAbsenceSchema,
  UpdatePlannedAbsenceSchema,
  type CreatePlannedAbsenceInput,
  type UpdatePlannedAbsenceInput,
} from '@/src/domain/validations/planned-absence'
import { ValidationError } from '@/src/lib/errors'

export type PlannedAbsenceType = 'day_off' | 'vacation'

export type PlannedAbsenceProps = {
  id: string
  type: PlannedAbsenceType
  date: Date
  endDate?: Date
  workedDays?: Date[]
  cancelledAt?: Date
  notes?: string
}

export class PlannedAbsence {
  readonly id: string
  readonly type: PlannedAbsenceType
  readonly date: Date
  readonly endDate?: Date
  readonly workedDays?: Date[]
  readonly cancelledAt?: Date
  readonly notes?: string

  private constructor(props: PlannedAbsenceProps) {
    this.id = props.id
    this.type = props.type
    this.date = props.date
    this.endDate = props.endDate
    this.workedDays = props.workedDays
    this.cancelledAt = props.cancelledAt
    this.notes = props.notes
  }

  static create(
    input: CreatePlannedAbsenceInput & { id: string }
  ): PlannedAbsence {
    const parsed = CreatePlannedAbsenceSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    return new PlannedAbsence({
      id: input.id,
      type: parsed.data.type,
      date: parsed.data.date,
      endDate: parsed.data.endDate,
      notes: parsed.data.notes,
    })
  }

  static reconstitute(props: PlannedAbsenceProps): PlannedAbsence {
    return new PlannedAbsence(props)
  }

  update(input: UpdatePlannedAbsenceInput): PlannedAbsence {
    const parsed = UpdatePlannedAbsenceSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    return new PlannedAbsence({
      id: this.id,
      type: this.type,
      date: this.date,
      endDate: this.endDate,
      workedDays:
        input.workedDays !== undefined ? input.workedDays : this.workedDays,
      cancelledAt:
        input.cancelledAt !== undefined ? input.cancelledAt : this.cancelledAt,
      notes: input.notes !== undefined ? (input.notes ?? undefined) : this.notes,
    })
  }
}
