import {
  PlannedAbsence,
  type PlannedAbsenceType,
} from '@/src/domain/entities/planned-absence'
import type { IPlannedAbsenceRepository } from '@/src/domain/repositories/planned-absence.interface.repository'
import type * as schema from '@/src/infra/db/schema'
import { plannedAbsences } from '@/src/infra/db/schema/planned-absences.drizzle-schema'
import { StorageError } from '@/src/lib/errors'
import { and, eq, gte, lte } from 'drizzle-orm'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

type DB = ExpoSQLiteDatabase<typeof schema>

export class DrizzlePlannedAbsenceRepository implements IPlannedAbsenceRepository {
  constructor(private readonly db: DB) {}

  async create(absence: PlannedAbsence): Promise<PlannedAbsence> {
    try {
      await this.db.insert(plannedAbsences).values({
        id: absence.id,
        type: absence.type,
        date: absence.date,
        endDate: absence.endDate ?? null,
        workedDays: absence.workedDays
          ? JSON.stringify(absence.workedDays.map((d) => d.getTime()))
          : null,
        cancelledAt: absence.cancelledAt ?? null,
        notes: absence.notes ?? null,
      })
      return absence
    } catch (err) {
      throw new StorageError('Failed to create planned absence', err)
    }
  }

  async findById(id: string): Promise<PlannedAbsence | null> {
    try {
      const rows = await this.db
        .select()
        .from(plannedAbsences)
        .where(eq(plannedAbsences.id, id))
      if (rows.length === 0) return null
      return this.toEntity(rows[0])
    } catch (err) {
      throw new StorageError('Failed to find planned absence', err)
    }
  }

  async findByDateRange(from: Date, to: Date): Promise<PlannedAbsence[]> {
    try {
      const rows = await this.db
        .select()
        .from(plannedAbsences)
        .where(
          and(gte(plannedAbsences.date, from), lte(plannedAbsences.date, to))
        )
      return rows.map((r) => this.toEntity(r))
    } catch (err) {
      throw new StorageError(
        'Failed to find planned absences by date range',
        err
      )
    }
  }

  async update(absence: PlannedAbsence): Promise<PlannedAbsence> {
    try {
      await this.db
        .update(plannedAbsences)
        .set({
          workedDays: absence.workedDays
            ? JSON.stringify(absence.workedDays.map((d) => d.getTime()))
            : null,
          cancelledAt: absence.cancelledAt ?? null,
          notes: absence.notes ?? null,
        })
        .where(eq(plannedAbsences.id, absence.id))
      return absence
    } catch (err) {
      throw new StorageError('Failed to update planned absence', err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(plannedAbsences).where(eq(plannedAbsences.id, id))
    } catch (err) {
      throw new StorageError('Failed to delete planned absence', err)
    }
  }

  private toEntity(row: typeof plannedAbsences.$inferSelect): PlannedAbsence {
    const workedDays: Date[] | undefined = row.workedDays
      ? (JSON.parse(row.workedDays) as number[]).map((t) => new Date(t))
      : undefined
    return PlannedAbsence.reconstitute({
      id: row.id,
      type: row.type as PlannedAbsenceType,
      date: row.date,
      endDate: row.endDate ?? undefined,
      workedDays,
      cancelledAt: row.cancelledAt ?? undefined,
      notes: row.notes ?? undefined,
    })
  }
}
