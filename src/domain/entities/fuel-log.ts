import { ValidationError } from '@/src/lib/errors'
import {
  CreateFuelLogSchema,
  type CreateFuelLogInput,
} from '../validations/fuel-log'

type FuelLogProps = {
  id: string
  date: Date
  fuelType: string
  liters: number
  totalPrice: number
  odometer: number
}

export class FuelLog {
  readonly id: string
  readonly date: Date
  readonly fuelType: string
  readonly liters: number
  readonly totalPrice: number
  readonly odometer: number

  private constructor(props: FuelLogProps) {
    this.id = props.id
    this.date = props.date
    this.fuelType = props.fuelType
    this.liters = props.liters
    this.totalPrice = props.totalPrice
    this.odometer = props.odometer
  }

  /** Validates input and constructs a new FuelLog. Throws ValidationError on invalid data. */
  static create(input: CreateFuelLogInput & { id: string }): FuelLog {
    const result = CreateFuelLogSchema.safeParse(input)
    if (!result.success)
      throw new ValidationError(result.error.issues[0].message)
    const d = result.data
    return new FuelLog({
      id: input.id,
      date: d.date ?? new Date(),
      fuelType: d.fuelType,
      liters: d.liters,
      totalPrice: d.totalPrice,
      odometer: d.odometer,
    })
  }

  /** Reconstitute from persistence — skips validation (data is already trusted). */
  static reconstitute(props: FuelLogProps): FuelLog {
    return new FuelLog(props)
  }

  // ─── Domain behaviours ────────────────────────────────────────────────

  /** Cost per litre for this fill-up (totalPrice / liters), rounded to 2 d.p. */
  get pricePerLiter(): number {
    return Math.round((this.totalPrice / this.liters) * 100) / 100
  }

  /**
   * Fuel efficiency relative to the previous fill-up of the same fuel type.
   * Returns null when the odometer delta is ≤ 0 or liters is 0.
   */
  kmPerLiter(previousLog: FuelLog): number | null {
    const km = this.odometer - previousLog.odometer
    if (km <= 0 || this.liters <= 0) return null
    return Math.round((km / this.liters) * 100) / 100
  }
}
