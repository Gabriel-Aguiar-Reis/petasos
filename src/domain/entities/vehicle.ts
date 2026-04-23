import {
  CreateVehicleSchema,
  type CreateVehicleInput,
  type UpdateVehicleInput,
} from '@/src/domain/validations/vehicle'
import { ValidationError } from '@/src/lib/errors'

type VehicleProps = {
  id: string
  name: string
  plate: string
  brand: string
  model: string
  year: number
  fuelTypeId: string
  typeId: string
  color?: string
  notes?: string
}

export class Vehicle {
  readonly id: string
  readonly name: string
  readonly plate: string
  readonly brand: string
  readonly model: string
  readonly year: number
  readonly fuelTypeId: string
  readonly typeId: string
  readonly color?: string
  readonly notes?: string

  private constructor(props: VehicleProps) {
    this.id = props.id
    this.name = props.name
    this.plate = props.plate
    this.brand = props.brand
    this.model = props.model
    this.year = props.year
    this.fuelTypeId = props.fuelTypeId
    this.typeId = props.typeId
    this.color = props.color
    this.notes = props.notes
  }

  /** Validates input and constructs a new Vehicle. Throws ValidationError on invalid data. */
  static create(input: CreateVehicleInput & { id: string }): Vehicle {
    const result = CreateVehicleSchema.safeParse(input)
    if (!result.success)
      throw new ValidationError(result.error.issues[0].message)
    const d = result.data
    return new Vehicle({
      id: input.id,
      name: d.name,
      plate: d.plate,
      brand: d.brand,
      model: d.model,
      year: d.year,
      fuelTypeId: d.fuelTypeId,
      typeId: d.typeId,
      color: d.color,
      notes: d.notes,
    })
  }

  /** Reconstitute from persistence — skips validation (data is already trusted). */
  static reconstitute(props: VehicleProps): Vehicle {
    return new Vehicle(props)
  }

  /** Returns a new Vehicle instance with the applied updates. */
  update(input: UpdateVehicleInput): Vehicle {
    return new Vehicle({
      id: this.id,
      name: input.name ?? this.name,
      plate: input.plate ?? this.plate,
      brand: input.brand ?? this.brand,
      model: input.model ?? this.model,
      year: input.year ?? this.year,
      fuelTypeId: input.fuelTypeId ?? this.fuelTypeId,
      typeId: input.typeId ?? this.typeId,
      color: input.color !== undefined ? (input.color ?? undefined) : this.color,
      notes: input.notes !== undefined ? (input.notes ?? undefined) : this.notes,
    })
  }

  // ─── Domain behaviours ────────────────────────────────────────────────

  /** Human-readable label: "Name (PLATE)" or just "Name" when plate is absent. */
  get displayName(): string {
    return this.plate.trim().length > 0
      ? `${this.name} (${this.plate})`
      : this.name
  }
}
