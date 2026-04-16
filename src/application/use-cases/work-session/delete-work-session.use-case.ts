import type { IWorkSessionRepository } from '@/src/domain/repositories/work-session.interface.repository'

export class DeleteWorkSession {
  constructor(private readonly workSessionRepository: IWorkSessionRepository) {}

  async execute(id: string): Promise<void> {
    await this.workSessionRepository.findById(id)
    await this.workSessionRepository.delete(id)
  }
}
