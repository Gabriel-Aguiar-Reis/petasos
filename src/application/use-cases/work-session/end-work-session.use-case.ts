import type { WorkSession } from '@/src/domain/entities/work-session'
import type { IWorkSessionRepository } from '@/src/domain/repositories/work-session.interface.repository'
import { ConflictError } from '@/src/lib/errors'

export class EndWorkSession {
  constructor(private readonly workSessionRepository: IWorkSessionRepository) {}

  async execute(): Promise<WorkSession> {
    const active = await this.workSessionRepository.findActive()
    if (active === null) {
      throw new ConflictError('No active work session to end')
    }

    const ended = active.end()
    return this.workSessionRepository.update(ended)
  }
}
