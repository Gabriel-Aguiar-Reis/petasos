import { AppError } from '@/src/lib/errors/app-error'

export class StorageError extends AppError {
  readonly code = 'STORAGE_ERROR' as const
  readonly cause: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.cause = cause
  }
}
