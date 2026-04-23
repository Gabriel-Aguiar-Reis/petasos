import type { Recurrence } from '@/src/domain/entities/recurrence'
import {
  CreateCostSchema,
  UpdateCostSchema,
  type CreateCostInput,
  type UpdateCostInput,
} from '@/src/domain/validations/cost'
import { ValidationError } from '@/src/lib/errors'

export type CostCategory =
  | 'fuel'
  | 'maintenance'
  | 'food'
  | 'parking_tolls'
  | 'custom'

export const COST_CATEGORIES = [
  'Combustível',
  'Manutenção',
  'Pedágio',
  'IPVA',
  'Seguro',
  'Depreciação',
  'Financiamento',
  'Estacionamento',
  'Lavagem',
  'Outros',
] as const
export type KnownCostCategory = (typeof COST_CATEGORIES)[number]

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
  description?: string
  recurrence?: Recurrence
  tags?: string[]
}

export class Cost {
  readonly id: string
  readonly date: Date
  readonly amount: number
  readonly category: string
  readonly description?: string
  readonly recurrence?: Recurrence
  readonly tags?: string[]

  private constructor(props: CostProps) {
    this.id = props.id
    this.date = props.date
    this.amount = props.amount
    this.category = props.category
    this.description = props.description
    this.recurrence = props.recurrence
    this.tags = props.tags
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
      description: d.description,
      recurrence: d.recurrence,
      tags: d.tags,
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
      description:
        d.description !== undefined
          ? (d.description ?? undefined)
          : this.description,
      recurrence:
        d.recurrence !== undefined
          ? (d.recurrence ?? undefined)
          : this.recurrence,
      tags: d.tags !== undefined ? (d.tags ?? undefined) : this.tags,
    })
  }
}
