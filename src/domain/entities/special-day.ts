import {
  CreateSpecialDaySchema,
  type CreateSpecialDayInput,
} from '@/src/domain/validations/special-day'
import { ConflictError, ValidationError } from '@/src/lib/errors'

export type SpecialDaySource = 'custom' | 'official'

export type SpecialDayProps = {
  id: string
  date: Date
  description: string
  source: SpecialDaySource
  type?: string
}

export class SpecialDay {
  readonly id: string
  readonly date: Date
  readonly description: string
  readonly source: SpecialDaySource
  readonly type?: string

  private constructor(props: SpecialDayProps) {
    this.id = props.id
    this.date = props.date
    this.description = props.description
    this.source = props.source
    this.type = props.type
  }

  static create(input: CreateSpecialDayInput & { id: string }): SpecialDay {
    const parsed = CreateSpecialDaySchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    return new SpecialDay({
      id: input.id,
      date: parsed.data.date,
      description: parsed.data.description,
      source: 'custom',
      type: parsed.data.type,
    })
  }

  static reconstitute(props: SpecialDayProps): SpecialDay {
    return new SpecialDay(props)
  }

  delete(): void {
    if (this.source === 'official') {
      throw new ConflictError('Cannot delete official special day')
    }
  }
}
