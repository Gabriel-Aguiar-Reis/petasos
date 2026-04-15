import type { WorkSession } from '@/src/domain/entities/work-session'

export interface IWorkSessionRepository {
  create(session: WorkSession): Promise<WorkSession>
  findById(id: string): Promise<WorkSession>
  findAll(): Promise<WorkSession[]>
  findActive(): Promise<WorkSession | null>
  update(session: WorkSession): Promise<WorkSession>
  delete(id: string): Promise<void>
}
