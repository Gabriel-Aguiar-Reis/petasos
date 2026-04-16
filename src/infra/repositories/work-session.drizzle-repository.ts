import { WorkSession } from '@/src/domain/entities/work-session'
import type { IWorkSessionRepository } from '@/src/domain/repositories/work-session.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { workSessions } from '@/src/infra/db/schema/work-sessions.drizzle-schema'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { eq, isNull } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleWorkSessionRepository implements IWorkSessionRepository {
  constructor(private readonly db: DB) {}

  async create(session: WorkSession): Promise<WorkSession> {
    try {
      await this.db.insert(workSessions).values({
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
      })
      return session
    } catch (err) {
      throw new StorageError('Failed to create work session', err)
    }
  }

  async findById(id: string): Promise<WorkSession> {
    try {
      const rows = await this.db
        .select()
        .from(workSessions)
        .where(eq(workSessions.id, id))
      if (rows.length === 0) throw new NotFoundError('WorkSession', id)
      return this.toEntity(rows[0])
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to find work session', err)
    }
  }

  async findAll(): Promise<WorkSession[]> {
    try {
      const rows = await this.db.select().from(workSessions)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list work sessions', err)
    }
  }

  async findActive(): Promise<WorkSession | null> {
    try {
      const rows = await this.db
        .select()
        .from(workSessions)
        .where(isNull(workSessions.endTime))
        .limit(1)
      return rows.length > 0 ? this.toEntity(rows[0]) : null
    } catch (err) {
      throw new StorageError('Failed to find active work session', err)
    }
  }

  async update(session: WorkSession): Promise<WorkSession> {
    try {
      await this.findById(session.id)
      await this.db
        .update(workSessions)
        .set({ startTime: session.startTime, endTime: session.endTime })
        .where(eq(workSessions.id, session.id))
      return session
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to update work session', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id)
      await this.db.delete(workSessions).where(eq(workSessions.id, id))
    } catch (err) {
      if (err instanceof NotFoundError) throw err
      throw new StorageError('Failed to delete work session', err)
    }
  }

  private toEntity(row: typeof workSessions.$inferSelect): WorkSession {
    return WorkSession.reconstitute({
      id: row.id,
      startTime: row.startTime,
      endTime: row.endTime ?? null,
    })
  }
}
