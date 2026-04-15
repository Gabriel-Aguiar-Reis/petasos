import { AppError } from '@/src/lib/errors/app-error'

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND' as const
  readonly entityName: string
  readonly entityId: string

  constructor(entityName: string, entityId: string) {
    super(`${entityName} with id "${entityId}" not found`)
    this.entityName = entityName
    this.entityId = entityId
  }
}
