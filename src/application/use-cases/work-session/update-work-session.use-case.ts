import { WorkSession } from '@/src/domain/entities/work-session'
import type { IWorkSessionRepository } from '@/src/domain/repositories/work-session.interface.repository'
import { NotFoundError, ValidationError } from '@/src/lib/errors'

export class UpdateWorkSession {
  constructor(private readonly repo: IWorkSessionRepository) {}

  async execute(
    id: string,
    input: { startTime?: Date; endTime?: Date | null }
  ): Promise<WorkSession> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('WorkSession', id)

    const startTime = input.startTime ?? existing.startTime
    const endTime =
      input.endTime !== undefined ? input.endTime : existing.endTime

    if (endTime !== null && startTime >= endTime) {
      throw new ValidationError('startTime must be before endTime')
    }

    const updated = WorkSession.reconstitute({
      id: existing.id,
      startTime,
      endTime,
    })

    return this.repo.update(updated)
  }
}
