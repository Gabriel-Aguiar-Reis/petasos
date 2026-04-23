import {
  CreateGoalSchema,
  type CreateGoalInput,
} from '@/src/domain/validations/goal'
import { ValidationError } from '@/src/lib/errors'

export type GoalType = 'daily' | 'weekly' | 'monthly'

type GoalProps = {
  id: string
  type: GoalType
  targetAmount: number
  periodStart: Date
}

export class Goal {
  readonly id: string
  readonly type: GoalType
  readonly targetAmount: number
  readonly periodStart: Date

  private constructor(props: GoalProps) {
    this.id = props.id
    this.type = props.type
    this.targetAmount = props.targetAmount
    this.periodStart = props.periodStart
  }

  /** Validates input and constructs a new Goal. Throws ValidationError on invalid data. */
  static create(input: CreateGoalInput & { id: string }): Goal {
    const result = CreateGoalSchema.safeParse(input)
    if (!result.success)
      throw new ValidationError(result.error.issues[0].message)
    const d = result.data
    return new Goal({
      id: input.id,
      type: d.type,
      targetAmount: d.targetAmount,
      periodStart: d.periodStart ?? new Date(),
    })
  }

  /** Reconstitute from persistence — skips validation (data is already trusted). */
  static reconstitute(props: GoalProps): Goal {
    return new Goal(props)
  }

  // ─── Domain behaviours ────────────────────────────────────────────────

  /**
   * Last moment of this goal's measurement period (inclusive).
   * - daily   → 23:59:59.999 of periodStart
   * - weekly  → 23:59:59.999 of periodStart + 6 days
   * - monthly → last millisecond of periodStart's calendar month
   */
  get periodEnd(): Date {
    const end = new Date(this.periodStart)
    if (this.type === 'daily') {
      end.setHours(23, 59, 59, 999)
    } else if (this.type === 'weekly') {
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
    } else {
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
    }
    return end
  }

  /** True when actual earnings meet or exceed the target amount. */
  isAchieved(actualEarnings: number): boolean {
    return actualEarnings >= this.targetAmount
  }

  /** Amount still needed to reach the target; 0 once the goal is achieved. */
  remainingAmount(actualEarnings: number): number {
    return Math.max(
      0,
      Math.round((this.targetAmount - actualEarnings) * 100) / 100
    )
  }

  /** True when the given date falls within [periodStart, periodEnd]. */
  contains(date: Date): boolean {
    return date >= this.periodStart && date <= this.periodEnd
  }
}
