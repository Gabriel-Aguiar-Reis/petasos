import { WorkSession } from '@/src/domain/entities/work-session'
import type { IWorkSessionRepository } from '@/src/domain/repositories/work-session.interface.repository'
import { ConflictError } from '@/src/lib/errors'
import { v4 as uuidv4 } from 'uuid'

export class StartWorkSession {
  constructor(private readonly workSessionRepository: IWorkSessionRepository) { }

  async execute(): Promise<WorkSession> {
    const active = await this.workSessionRepository.findActive()
    if (active !== null) {
      throw new ConflictError('A work session is already in progress')
    }

    const session = WorkSession.startNow(uuidv4())
    return this.workSessionRepository.create(session)
  }
}
