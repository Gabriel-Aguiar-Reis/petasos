import { WorkSession } from '@/src/domain/entities/work-session'
import type { IWorkSessionRepository } from '@/src/domain/repositories/work-session.interface.repository'
import { NotFoundError } from '@/src/lib/errors'

export class InMemoryWorkSessionRepository implements IWorkSessionRepository {
  private store: Map<string, WorkSession> = new Map()

  async create(session: WorkSession): Promise<WorkSession> {
    this.store.set(session.id, session)
    return session
  }

  async findById(id: string): Promise<WorkSession> {
    const session = this.store.get(id)
    if (!session) throw new NotFoundError('WorkSession', id)
    return session
  }

  async findAll(): Promise<WorkSession[]> {
    return Array.from(this.store.values())
  }

  async findActive(): Promise<WorkSession | null> {
    const active = Array.from(this.store.values()).find((s) => s.isActive)
    return active ?? null
  }

  async update(session: WorkSession): Promise<WorkSession> {
    await this.findById(session.id)
    this.store.set(session.id, session)
    return session
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    this.store.delete(id)
  }
}
