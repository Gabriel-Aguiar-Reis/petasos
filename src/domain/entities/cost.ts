import { ValidationError } from '@/src/lib/errors'
import {
  CreateCostSchema,
  UpdateCostSchema,
  type CreateCostInput,
  type UpdateCostInput,
} from '../validations/cost'

export type CostCategory =
  | 'fuel'
  | 'maintenance'
  | 'food'
  | 'parking_tolls'
  | 'custom'

const KNOWN_CATEGORIES: readonly CostCategory[] = [
  'fuel',
  'maintenance',
  'food',
  'parking_tolls',
  'custom',
]

type CostProps = {
  id: string
  date: Date
  amount: number
  category: string
}

export class Cost {
  readonly id: string
  readonly date: Date
  readonly amount: number
  readonly category: string

  private constructor(props: CostProps) {
    this.id = props.id
    this.date = props.date
    this.amount = props.amount
    this.category = props.category
  }

  /** Validates input and constructs a new Cost. Throws ValidationError on invalid data. */
  static create(input: CreateCostInput & { id: string }): Cost {
    const result = CreateCostSchema.safeParse(input)
    if (!result.success)
      throw new ValidationError(result.error.issues[0].message)
    const d = result.data
    return new Cost({
      id: input.id,
      date: d.date ?? new Date(),
      amount: d.amount,
      category: d.category,
    })
  }

  /** Reconstitute from persistence — skips validation (data is already trusted). */
  static reconstitute(props: CostProps): Cost {
    return new Cost(props)
  }

  // ─── Domain behaviours ────────────────────────────────────────────────

  /** True when category matches one of the pre-defined CostCategory values. */
  get isKnownCategory(): boolean {
    return KNOWN_CATEGORIES.includes(this.category as CostCategory)
  }

  /** Returns a new Cost with the supplied fields merged in. Validates before merging. */
  update(input: UpdateCostInput): Cost {
    const result = UpdateCostSchema.safeParse(input)
    if (!result.success)
      throw new ValidationError(result.error.issues[0].message)
    const d = result.data
    return Cost.reconstitute({
      id: this.id,
      date: d.date ?? this.date,
      amount: d.amount !== undefined ? d.amount : this.amount,
      category: d.category ?? this.category,
    })
  }
}
