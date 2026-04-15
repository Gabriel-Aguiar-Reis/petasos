import migrations from '@/src/infra/db/migrations/migrations'
import * as schema from '@/src/infra/db/schema'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import * as SQLite from 'expo-sqlite'

const expo = SQLite.openDatabaseSync('roadledger.db')

export const db = drizzle(expo, { schema })

/**
 * Apply pending Drizzle migrations. Must be called once at app startup
 * before any database queries are executed (e.g., in app/_layout.tsx).
 */
export async function initializeDatabase(): Promise<void> {
  await migrate(db, migrations)
}
