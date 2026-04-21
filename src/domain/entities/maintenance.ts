import { ValidationError } from '@/src/lib/errors'
import {
  CreateMaintenanceSchema,
  UpdateMaintenanceSchema,
  type CreateMaintenanceInput,
  type UpdateMaintenanceInput,
} from '../validations/maintenance'

export type MaintenanceTrigger =
  | { type: 'date'; date: Date }
  | { type: 'mileage'; mileage: number }

export type MaintenanceProps = {
  id: string
  vehicleId: string
  title: string
  estimatedCost: number
  trigger: MaintenanceTrigger
  completedAt?: Date
  notes?: string
}

export class Maintenance {
  readonly id: string
  readonly vehicleId: string
  readonly title: string
  readonly estimatedCost: number
  readonly trigger: MaintenanceTrigger
  readonly completedAt?: Date
  readonly notes?: string

  private constructor(props: MaintenanceProps) {
    this.id = props.id
    this.vehicleId = props.vehicleId
    this.title = props.title
    this.estimatedCost = props.estimatedCost
    this.trigger = props.trigger
    this.completedAt = props.completedAt
    this.notes = props.notes
  }

  static create(input: CreateMaintenanceInput & { id: string }): Maintenance {
    const parsed = CreateMaintenanceSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    return new Maintenance({
      id: input.id,
      vehicleId: parsed.data.vehicleId,
      title: parsed.data.title,
      estimatedCost: parsed.data.estimatedCost,
      trigger: parsed.data.trigger as MaintenanceTrigger,
      notes: parsed.data.notes,
    })
  }

  static reconstitute(props: MaintenanceProps): Maintenance {
    return new Maintenance(props)
  }

  update(input: UpdateMaintenanceInput): Maintenance {
    const parsed = UpdateMaintenanceSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    return new Maintenance({
      id: this.id,
      vehicleId: this.vehicleId,
      title: input.title !== undefined ? input.title : this.title,
      estimatedCost:
        input.estimatedCost !== undefined
          ? input.estimatedCost
          : this.estimatedCost,
      trigger:
        input.trigger !== undefined
          ? (input.trigger as MaintenanceTrigger)
          : this.trigger,
      completedAt:
        input.completedAt !== undefined ? input.completedAt : this.completedAt,
      notes: input.notes !== undefined ? (input.notes ?? undefined) : this.notes,
    })
  }
}
