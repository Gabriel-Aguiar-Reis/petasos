import { Reminder } from '@/src/domain/entities/reminder'
import type { IReminderRepository } from '@/src/domain/repositories/reminder.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { reminders } from '@/src/infra/db/schema/reminders.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { eq } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzleReminderRepository implements IReminderRepository {
  constructor(private readonly db: DB) {}

  async create(reminder: Reminder): Promise<Reminder> {
    try {
      await this.db.insert(reminders).values({
        id: reminder.id,
        message: reminder.message,
        date: reminder.date,
        alarm: reminder.alarm,
        recurrenceRule: reminder.recurrence?.rule ?? null,
        recurrenceEndDate: reminder.recurrence?.endDate ?? null,
        recurrenceExceptions: reminder.recurrence?.exceptions
          ? JSON.stringify(
              reminder.recurrence.exceptions.map((d) => d.getTime())
            )
          : null,
        notes: reminder.notes ?? null,
      })
      return reminder
    } catch (err) {
      throw new StorageError('Failed to create reminder', err)
    }
  }

  async findById(id: string): Promise<Reminder | null> {
    try {
      const rows = await this.db
        .select()
        .from(reminders)
        .where(eq(reminders.id, id))
      if (rows.length === 0) return null
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to find reminder', err)
    }
  }

  async findAll(): Promise<Reminder[]> {
    try {
      const rows = await this.db.select().from(reminders)
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError('Failed to list reminders', err)
    }
  }

  async update(reminder: Reminder): Promise<Reminder> {
    try {
      await this.db
        .update(reminders)
        .set({
          message: reminder.message,
          date: reminder.date,
          alarm: reminder.alarm,
          recurrenceRule: reminder.recurrence?.rule ?? null,
          recurrenceEndDate: reminder.recurrence?.endDate ?? null,
          recurrenceExceptions: reminder.recurrence?.exceptions
            ? JSON.stringify(
                reminder.recurrence.exceptions.map((d) => d.getTime())
              )
            : null,
          notes: reminder.notes ?? null,
        })
        .where(eq(reminders.id, reminder.id))
      return reminder
    } catch (err) {
      throw new StorageError('Failed to update reminder', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(reminders).where(eq(reminders.id, id))
    } catch (err) {
      throw new StorageError('Failed to delete reminder', err)
    }
  }

  private toEntity(row: typeof reminders.$inferSelect): Reminder {
    const exceptions: Date[] | undefined = row.recurrenceExceptions
      ? (JSON.parse(row.recurrenceExceptions) as number[]).map(
          (t) => new Date(t)
        )
      : undefined
    return Reminder.reconstitute({
      id: row.id,
      message: row.message,
      date: row.date,
      alarm: row.alarm,
      recurrence: row.recurrenceRule
        ? {
            rule: row.recurrenceRule,
            endDate: row.recurrenceEndDate ?? undefined,
            exceptions,
          }
        : undefined,
      notes: row.notes ?? undefined,
    })
  }
}
