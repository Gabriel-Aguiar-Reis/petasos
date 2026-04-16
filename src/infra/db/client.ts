import * as schema from '@/src/infra/db/schema'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as SQLite from 'expo-sqlite'

const expo = SQLite.openDatabaseSync('roadledger.db')

export const db = drizzle(expo, { schema })
