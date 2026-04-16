type VehicleProps = {
  id: string
  name: string
  plate: string | null
}

export class Vehicle {
  readonly id: string
  readonly name: string
  readonly plate: string | null

  private constructor(props: VehicleProps) {
    this.id = props.id
    this.name = props.name
    this.plate = props.plate
  }

  /** Reconstitute from persistence — skips validation (data is already trusted). */
  static reconstitute(props: VehicleProps): Vehicle {
    return new Vehicle(props)
  }

  // ─── Domain behaviours ────────────────────────────────────────────────

  /** True when a non-empty plate is registered. */
  get hasPlate(): boolean {
    return this.plate !== null && this.plate.trim().length > 0
  }

  /** Human-readable label: "Name (PLATE)" or just "Name" when plate is absent. */
  get displayName(): string {
    return this.hasPlate ? `${this.name} (${this.plate})` : this.name
  }
}
