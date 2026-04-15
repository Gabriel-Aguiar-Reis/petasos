# Data Model: App Backend

**Feature**: `001-app-backend`
**Date**: 2026-04-15
**Source**: spec.md entities + FR-001/FR-005/FR-019 + research.md R-002/R-007

---

## Domain Entities (TypeScript)

> Pure TypeScript types — no Zod or framework imports. These live in `src/domain/entities/`.

### User

```typescript
type User = {
  id: string // UUID v4
  name: string
}
```

### Vehicle

```typescript
type Vehicle = {
  id: string // UUID v4
  name: string // e.g. "HB20 Prata"
  plate: string // e.g. "ABC-1234"
}
```

### Trip

```typescript
type Trip = {
  id: string // UUID v4
  date: Date
  earnings: number // monetary, ≥ 0
  platform: string // free-form identifier (e.g. "Uber", "99")
  distance: number | null // km, nullable (quick-entry)
  duration: number | null // minutes, nullable (quick-entry)
  origin: string | null // nullable (quick-entry)
  destination: string | null // nullable (quick-entry)
  vehicleId: string | null // FK → Vehicle.id, nullable
}
```

### Cost

```typescript
type CostCategory = 'fuel' | 'maintenance' | 'food' | 'parking_tolls' | 'custom'

type Cost = {
  id: string // UUID v4
  date: Date
  amount: number // monetary, > 0
  category: string // CostCategory or free-form custom string
}
```

### FuelLog

```typescript
const FUEL_TYPES = ['Gasolina', 'Etanol', 'Diesel', 'GNV'] as const
type KnownFuelType = (typeof FUEL_TYPES)[number]

type FuelLog = {
  id: string // UUID v4
  date: Date
  fuelType: string // free-form; FUEL_TYPES provides standard UI suggestions
  liters: number // > 0
  totalPrice: number // monetary, > 0
  odometer: number // km; must be > previous log of same fuelType
  // derived (not stored): pricePerLiter = totalPrice / liters
}
```

### WorkSession

```typescript
type WorkSession = {
  id: string // UUID v4
  startTime: Date
  endTime: Date | null // null while session is active
}
```

### Goal

```typescript
type GoalType = 'daily' | 'weekly' | 'monthly'

type Goal = {
  id: string // UUID v4
  type: GoalType
  targetAmount: number // monetary, > 0
  periodStart: Date
  // period end is derived (not stored):
  // daily   → same calendar day as periodStart
  // weekly  → periodStart + 7 days
  // monthly → last day of periodStart's calendar month
}
```

---

## Zod Validation Schemas (Domain Layer)

> Zod **4.3.6** schemas for use-case input validation. Live in `src/domain/validations/`. Imported only by use cases — never by entities or repository interfaces.

```typescript
import { z } from 'zod'

export const CreateTripSchema = z.object({
  earnings: z.number().min(0),
  platform: z.string().min(1),
  date: z.date().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  distance: z.number().min(0).optional(),
  duration: z.number().min(0).optional(),
  vehicleId: z.string().uuid().optional(),
})

export const CreateCostSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.date().optional(),
})

export const CreateFuelLogSchema = z.object({
  fuelType: z.string().min(1),
  liters: z.number().positive(),
  totalPrice: z.number().positive(),
  odometer: z.number().min(0),
  date: z.date().optional(),
})

export const CreateGoalSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly']),
  targetAmount: z.number().positive(),
  periodStart: z.date(),
})

export const CreateVehicleSchema = z.object({
  name: z.string().min(1),
  plate: z.string().min(1),
})
```

---

## Repository Interfaces (Domain Layer)

> Live in `src/domain/repositories/`. No imports from Drizzle, SQLite, or Expo.

```typescript
// src/domain/repositories/base.ts
// Shared filter types
type DateRangeFilter = { from: Date; to: Date }

// Base interface — all repositories expose these operations
interface IRepository<T, CreateInput, UpdateInput = Partial<CreateInput>> {
  create(input: CreateInput): Promise<T>
  findById(id: string): Promise<T> // throws NotFoundError
  findAll(filters?: Record<string, unknown>): Promise<T[]>
  update(id: string, input: UpdateInput): Promise<T> // throws NotFoundError
  delete(id: string): Promise<void> // throws NotFoundError
}

interface ITripRepository extends IRepository<
  Trip,
  CreateTripInput,
  UpdateTripInput
> {
  findByFilter(filters: TripFilter): Promise<Trip[]>
}

interface ICostRepository extends IRepository<
  Cost,
  CreateCostInput,
  UpdateCostInput
> {
  findByFilter(filters: CostFilter): Promise<Cost[]>
}

interface IFuelLogRepository extends IRepository<FuelLog, CreateFuelLogInput> {
  findByFuelTypeOrderedByOdometer(fuelType: string): Promise<FuelLog[]>
}

interface IWorkSessionRepository extends IRepository<
  WorkSession,
  CreateWorkSessionInput
> {
  findActive(): Promise<WorkSession | null> // the open session (endTime IS NULL)
}

interface IGoalRepository extends IRepository<
  Goal,
  CreateGoalInput,
  UpdateGoalInput
> {}

interface IVehicleRepository extends IRepository<Vehicle, CreateVehicleInput> {}
```

---

## Drizzle ORM Schema (Infra Layer)

> Live in `src/infra/db/schema/`. Requires: `drizzle-orm` 0.45.2, `expo-sqlite` 55.0.15.

```typescript
import { integer, real, sqliteTable, text } from 'drizzle-orm/expo-sqlite'

// src/infra/db/schema/users.ts
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
})

// src/infra/db/schema/vehicles.ts
export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  plate: text('plate').notNull(),
})

// src/infra/db/schema/trips.ts
export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  earnings: real('earnings').notNull(), // ≥ 0
  platform: text('platform').notNull(),
  distance: real('distance'), // nullable
  duration: integer('duration'), // nullable, minutes
  origin: text('origin'), // nullable
  destination: text('destination'), // nullable
  vehicleId: text('vehicle_id').references(() => vehicles.id), // FK, nullable
})

// src/infra/db/schema/costs.ts
export const costs = sqliteTable('costs', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  amount: real('amount').notNull(), // > 0
  category: text('category').notNull(),
})

// src/infra/db/schema/fuelLogs.ts
export const fuelLogs = sqliteTable('fuel_logs', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  fuelType: text('fuel_type').notNull(), // required, free-form string
  liters: real('liters').notNull(), // > 0
  totalPrice: real('total_price').notNull(), // > 0
  odometer: real('odometer').notNull(), // km; > previous same fuelType
})

// src/infra/db/schema/workSessions.ts
export const workSessions = sqliteTable('work_sessions', {
  id: text('id').primaryKey(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }), // nullable
})

// src/infra/db/schema/goals.ts
export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['daily', 'weekly', 'monthly'] }).notNull(),
  targetAmount: real('target_amount').notNull(), // > 0
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
})
```

---

## Use Case Input/Output Types

### CreateTripInput / UpdateTripInput

```typescript
type CreateTripInput = {
  earnings: number // required; ≥ 0
  platform: string // required; non-empty
  date?: Date // defaults to now()
  origin?: string
  destination?: string
  distance?: number // km; ≥ 0 when provided
  duration?: number // minutes; ≥ 0 when provided
  vehicleId?: string
}
type UpdateTripInput = Partial<Omit<CreateTripInput, 'platform'>> & {
  platform?: string
}
```

### CreateCostInput / UpdateCostInput

```typescript
type CreateCostInput = {
  amount: number // required; > 0
  category: string // required; non-empty
  date?: Date // defaults to now()
}
type UpdateCostInput = Partial<CreateCostInput>
```

### CreateFuelLogInput

```typescript
type CreateFuelLogInput = {
  fuelType: string // required; non-empty
  liters: number // required; > 0
  totalPrice: number // required; > 0
  odometer: number // required; > previous same fuelType
  date?: Date // defaults to now()
}
```

### DashboardSummary (output)

```typescript
type PlatformEarnings = { platform: string; earnings: number }

type DashboardSummary = {
  dateRange: DateRangeFilter
  totalEarnings: number
  totalCosts: number
  netProfit: number // totalEarnings − totalCosts
  earningsByPlatform: PlatformEarnings[]
  costPerKm: number | null // null if no trips with distance
}
```

### FuelEfficiencyResult (output)

```typescript
type FuelEfficiencyResult = {
  fuelType: string
  kmPerLiter: number | null // null if < 2 logs of this type
  costPerKm: number | null // null if kmPerLiter is null
  logCount: number
}
```

### GoalProgress (output)

```typescript
type GoalProgress = {
  goal: Goal
  periodStart: Date
  periodEnd: Date // derived
  totalEarnings: number // gross earnings in period (not net profit)
  progressPct: number // capped at 100
}
```

### ExportEnvelope (output)

```typescript
type ExportEnvelope = {
  exportedAt: string // ISO 8601
  filters: {
    dateRange?: { from: string; to: string }
    platform?: string
  }
  trips: Trip[]
  costs: Cost[]
  fuelLogs: FuelLog[]
  workSessions: WorkSession[]
  goals: Goal[]
}
```

---

## State Transitions

### WorkSession

```
[No active session]
      │ StartWorkSession
      ▼
[Active session: endTime = null]
      │ EndWorkSession
      ▼
[Closed session: endTime = Date]
```

- `StartWorkSession` throws `ConflictError` if any session with `endTime IS NULL` exists.
- `EndWorkSession` throws `ConflictError` if no active session exists.

---

## Validation Rules Summary

| Entity          | Field        | Rule                                                    |
| --------------- | ------------ | ------------------------------------------------------- |
| Trip            | earnings     | ≥ 0                                                     |
| Trip            | distance     | ≥ 0 when provided                                       |
| Trip            | duration     | ≥ 0 when provided                                       |
| Trip            | platform     | non-empty string                                        |
| Cost            | amount       | > 0                                                     |
| Cost            | category     | non-empty string                                        |
| FuelLog         | liters       | > 0                                                     |
| FuelLog         | totalPrice   | > 0                                                     |
| FuelLog         | odometer     | > previous log of same fuelType (or any value if first) |
| FuelLog         | fuelType     | non-empty string                                        |
| Goal            | targetAmount | > 0                                                     |
| WorkSession     | —            | max 1 active (endTime IS NULL) at a time                |
| DateRangeFilter | from / to    | from ≤ to                                               |
