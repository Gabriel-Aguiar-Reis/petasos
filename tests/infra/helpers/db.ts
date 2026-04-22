import * as schema from '@/src/infra/db/schema'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'

/**
 * Creates an isolated in-memory SQLite database for each integration test.
 * Uses better-sqlite3 so the tests run in Node.js without Expo dependencies.
 * The returned db is cast to ExpoSQLiteDatabase because both adapters share
 * the same Drizzle query API surface at runtime.
 */
export function createTestDb(): ExpoSQLiteDatabase<typeof schema> {
  const sqlite = new Database(':memory:')

  sqlite.exec(`
    CREATE TABLE vehicles (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      plate        TEXT NOT NULL DEFAULT '',
      brand        TEXT NOT NULL DEFAULT '',
      model        TEXT NOT NULL DEFAULT '',
      year         INTEGER NOT NULL DEFAULT 2020,
      fuel_type_id TEXT NOT NULL DEFAULT '',
      type_id      TEXT NOT NULL DEFAULT '',
      color        TEXT,
      notes        TEXT
    );

    CREATE TABLE trips (
      id          TEXT PRIMARY KEY,
      date        INTEGER NOT NULL,
      earnings    REAL    NOT NULL,
      platform_id TEXT    NOT NULL,
      distance    REAL,
      duration    INTEGER,
      origin      TEXT,
      destination TEXT,
      vehicle_id  TEXT REFERENCES vehicles(id)
    );

    CREATE TABLE costs (
      id                    TEXT PRIMARY KEY,
      date                  INTEGER NOT NULL,
      amount                REAL    NOT NULL,
      category              TEXT    NOT NULL,
      description           TEXT,
      recurrence_rule       TEXT,
      recurrence_end_date   INTEGER,
      recurrence_exceptions TEXT,
      tags                  TEXT
    );

    CREATE TABLE fuel_logs (
      id          TEXT PRIMARY KEY,
      date        INTEGER NOT NULL,
      fuel_type   TEXT    NOT NULL,
      liters      REAL    NOT NULL,
      total_price REAL    NOT NULL,
      odometer    REAL    NOT NULL
    );

    CREATE TABLE goals (
      id             TEXT PRIMARY KEY,
      type           TEXT    NOT NULL,
      target_amount  REAL    NOT NULL,
      period_start   INTEGER NOT NULL
    );

    CREATE TABLE work_sessions (
      id         TEXT PRIMARY KEY,
      start_time INTEGER NOT NULL,
      end_time   INTEGER
    );
  `)

  const db = drizzle(sqlite, { schema })
  return db as unknown as ExpoSQLiteDatabase<typeof schema>
}
