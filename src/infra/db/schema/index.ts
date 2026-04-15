// Schema barrel — re-export all tables so drizzle client gets full type info
// and drizzle-kit can discover all schemas in one import
export * from '@/src/infra/db/schema/costs.drizzle-schema'
export * from '@/src/infra/db/schema/fuel-logs.drizzle-schema'
export * from '@/src/infra/db/schema/goals.drizzle-schema'
export * from '@/src/infra/db/schema/trips.drizzle-schema'
export * from '@/src/infra/db/schema/users.drizzle-schema'
export * from '@/src/infra/db/schema/vehicles.drizzle-schema'
export * from '@/src/infra/db/schema/work-sessions.drizzle-schema'
