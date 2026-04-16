import { AppError } from '@/src/lib/errors/app-error'

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR' as const

  constructor(message: string) {
    super(message)
  }
}
