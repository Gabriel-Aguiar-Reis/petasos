import {
  CreateTripSchema,
  UpdateTripSchema,
  type CreateTripInput,
  type UpdateTripInput,
} from '@/src/domain/validations/trip'
import { ValidationError } from '@/src/lib/errors'

type TripProps = {
  id: string
  date: Date
  earnings: number
  platformId: string
  distance: number | null
  duration: number | null
  origin: string | null
  destination: string | null
  vehicleId: string | null
}

export class Trip {
  readonly id: string
  readonly date: Date
  readonly earnings: number
  readonly platformId: string
  readonly distance: number | null
  readonly duration: number | null
  readonly origin: string | null
  readonly destination: string | null
  readonly vehicleId: string | null

  private constructor(props: TripProps) {
    this.id = props.id
    this.date = props.date
    this.earnings = props.earnings
    this.platformId = props.platformId
    this.distance = props.distance
    this.duration = props.duration
    this.origin = props.origin
    this.destination = props.destination
    this.vehicleId = props.vehicleId
  }

  /** Validates input and constructs a new Trip. Throws ValidationError on invalid data. */
  static create(input: CreateTripInput & { id: string }): Trip {
    const result = CreateTripSchema.safeParse(input)
    if (!result.success)
      throw new ValidationError(result.error.issues[0].message)
    const d = result.data
    return new Trip({
      id: input.id,
      date: d.date ?? new Date(),
      earnings: d.earnings,
      platformId: d.platformId,
      distance: d.distance ?? null,
      duration: d.duration ?? null,
      origin: d.origin ?? null,
      destination: d.destination ?? null,
      vehicleId: d.vehicleId ?? null,
    })
  }

  /** Reconstitute from persistence — skips validation (data is already trusted). */
  static reconstitute(props: TripProps): Trip {
    return new Trip(props)
  }

  // ─── Domain behaviours ────────────────────────────────────────────────

  /** True when all optional fields are populated (not a quick-entry record). */
  get isComplete(): boolean {
    return (
      this.distance !== null &&
      this.duration !== null &&
      this.origin !== null &&
      this.destination !== null
    )
  }

  /** True when at least one optional field is missing — registered via quick-entry overlay. */
  get isQuickEntry(): boolean {
    return !this.isComplete
  }

  /** Earnings per km driven; null when distance is unknown or zero. */
  get earningsPerKm(): number | null {
    if (this.distance === null || this.distance === 0) return null
    return Math.round((this.earnings / this.distance) * 100) / 100
  }

  /** Earnings per minute of driving; null when duration is unknown or zero. */
  get earningsPerMinute(): number | null {
    if (this.duration === null || this.duration === 0) return null
    return Math.round((this.earnings / this.duration) * 100) / 100
  }

  /** Returns a new Trip with the supplied fields merged in. Validates before merging. */
  update(input: UpdateTripInput): Trip {
    const result = UpdateTripSchema.safeParse(input)
    if (!result.success)
      throw new ValidationError(result.error.issues[0].message)
    const d = result.data
    return Trip.reconstitute({
      id: this.id,
      date: d.date ?? this.date,
      earnings: d.earnings !== undefined ? d.earnings : this.earnings,
      platformId: d.platformId ?? this.platformId,
      distance: d.distance !== undefined ? d.distance : this.distance,
      duration: d.duration !== undefined ? d.duration : this.duration,
      origin: d.origin !== undefined ? d.origin : this.origin,
      destination:
        d.destination !== undefined ? d.destination : this.destination,
      vehicleId: d.vehicleId !== undefined ? d.vehicleId : this.vehicleId,
    })
  }
}
