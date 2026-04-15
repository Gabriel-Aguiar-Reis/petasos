import { AppError } from '@/src/lib/errors/app-error'

export class ConflictError extends AppError {
  readonly code = 'CONFLICT' as const

  constructor(message: string) {
    super(message)
  }
}
