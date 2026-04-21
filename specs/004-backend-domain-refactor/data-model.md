# Data Model: Backend Domain Refactor

**Feature**: `004-backend-domain-refactor`
**Date**: 2026-04-20
**Source**: spec.md entities + changes.md types + research.md R-001…R-009

---

## Domain Entities (TypeScript)

> Pure TypeScript types and classes — zero imports from Expo, React Native, SQLite, or rrule.
> Live in `src/domain/entities/`. Zod schemas in `src/domain/validations/`.

---

### Primitives & Support Types

```typescript
// src/domain/entities/recurrence.ts
export type RecurrenceRule = string // RFC 5545 RRULE string

export type Recurrence = {
  rule: RecurrenceRule
  endDate?: Date
  exceptions?: Date[]
}
```

---

### Lookup Entities (new)

```typescript
// src/domain/entities/fuel-type.ts
export type FuelType = {
  id: string
  name: string // e.g. "Gasolina", "Etanol", "Diesel", "Elétrico", "GNV"
  description?: string
  tags?: string[]
}

// src/domain/entities/vehicle-type.ts
export type VehicleType = {
  id: string
  name: string // e.g. "Carro", "Moto", "Caminhão"
  description?: string
  tags?: string[]
}

// src/domain/entities/trip-platform.ts
export type TripPlatform = {
  id: string
  name: string // e.g. "Uber", "99", "InDrive", "Particular"
  description?: string
  tags?: string[]
}
```

---

### Vehicle _(updated)_

Adds `brand`, `model`, `year`, `fuelTypeId`, `typeId`, `color`, `notes`.
`plate` changes from `string | null` to `string` (required).

```typescript
// src/domain/entities/vehicle.ts  (replaces existing)
export class Vehicle {
  readonly id: string
  readonly name: string
  readonly plate: string
  readonly brand: string // NEW
  readonly model: string // NEW
  readonly year: number // NEW
  readonly fuelTypeId: string // NEW — FK → FuelType.id
  readonly typeId: string // NEW — FK → VehicleType.id
  readonly color?: string // NEW
  readonly notes?: string // NEW
  // ...create() / reconstitute() / displayName same pattern as 001
}
```

---

### Trip _(updated)_

`platform: string` is replaced by `platformId: string` (FK → TripPlatform).

```typescript
// src/domain/entities/trip.ts  (updated field)
export class Trip {
  readonly id: string
  readonly date: Date
  readonly earnings: number
  readonly platformId: string // replaces platform: string
  readonly distance: number | null
  readonly duration: number | null
  readonly origin: string | null
  readonly destination: string | null
  readonly vehicleId: string | null
}
```

---

### Cost _(updated)_

Adds optional `recurrence: Recurrence` and `tags?: string[]`.
`description` is also added as an optional field.

```typescript
// src/domain/entities/cost.ts  (extended)
export class Cost {
  readonly id: string
  readonly date: Date
  readonly amount: number
  readonly category: string // KnownCostCategory | free-form string
  readonly description?: string // NEW
  readonly recurrence?: Recurrence // NEW
  readonly tags?: string[] // NEW
}

// Known categories (const array stays in domain)
export const COST_CATEGORIES = [
  'Combustível',
  'Manutenção',
  'Pedágio',
  'IPVA',
  'Seguro',
  'Depreciação',
  'Financiamento',
  'Estacionamento',
  'Lavagem',
  'Outros',
] as const
export type KnownCostCategory = (typeof COST_CATEGORIES)[number]
```

---

### FuelLog _(deprecated → replaced)_

`FuelLog` is superseded by `FuelPriceRecord` + `FuelConsumptionRecord`.
The existing table is migrated (see Drizzle Schemas section). The class file is kept but marked `@deprecated` until the UI migrates.

---

### FuelPriceRecord _(new)_

```typescript
// src/domain/entities/fuel-price-record.ts
export type FuelGaugeMeasurement = {
  before: number
  after: number
}

export type FuelPriceRecord = {
  id: string
  fuelTypeId: string // FK → FuelType.id
  date: Date
  pricePerLiter: number
  notes?: string
}
```

---

### FuelConsumptionRecord _(new)_

```typescript
// src/domain/entities/fuel-consumption-record.ts
export type FuelConsumptionRecord = {
  id: string
  date: Date
  vehicleId: string // FK → Vehicle.id
  fuelTypeId: string // FK → FuelType.id
  startMileage: number
  endMileage: number
  fuelAdded: number // litres
  averageConsumption: number // km/l — computed by calculateAverageConsumption()
  fuelGaugeMeasurement?: FuelGaugeMeasurement
  fuelGaugeTotalCapacity?: number
  tags?: string[]
  notes?: string
}
```

---

### MileageRecord _(new)_

```typescript
// src/domain/entities/mileage-record.ts
export type MileageRecord = {
  id: string
  vehicleId: string // FK → Vehicle.id
  date: Date
  mileage: number
  notes?: string
}
```

---

### Profit _(new)_

```typescript
// src/domain/entities/profit.ts
export type Profit = {
  id: string
  date: Date
  amount: number // > 0
  platformId: string // FK → TripPlatform.id
  description?: string
  tags?: string[]
}
```

---

### WorkSession _(updated — update support)_

No new fields. The entity is unchanged; the **repository interface** and use case gain an `update` operation for `startTime` and `endTime`.

---

### Reminder _(new)_

```typescript
// src/domain/entities/reminder.ts
export type Reminder = {
  id: string
  date: Date
  message: string
  alarm: boolean
  notes?: string
  recurrence?: Recurrence
  tags?: string[]
}
```

---

### MaintenanceTrigger & Maintenance _(new)_

```typescript
// src/domain/entities/maintenance.ts
export type MaintenanceTrigger =
  | { type: 'date'; date: Date }
  | { type: 'mileage'; mileage: number }

export type Maintenance = {
  id: string
  vehicleId: string // FK → Vehicle.id
  name: string
  description: string
  trigger: MaintenanceTrigger
  estimatedCost: number
  actualCost?: number
  completedAt?: Date
  tags?: string[]
  notes?: string
}
```

---

### SpecialDay _(new)_

```typescript
// src/domain/entities/special-day.ts
export type SpecialDay = {
  id: string
  date: Date
  type: 'holiday' | 'optional' | 'event'
  description: string
  source: 'official' | 'custom'
  tags?: string[]
  notes?: string
}
```

---

### PlannedAbsence _(new)_

```typescript
// src/domain/entities/planned-absence.ts
export type PlannedAbsence = {
  id: string
  date: Date
  endDate?: Date // required when type = 'vacation'; must be ≥ date
  type: 'day_off' | 'vacation'
  workedDays?: Date[]
  cancelledAt?: Date
  notes?: string
  tags?: string[]
}
```

---

### TripOfferRecord _(new)_

```typescript
// src/domain/entities/trip-offer-record.ts
export type TripOfferRecord = {
  id: string
  platformId: string // FK → TripPlatform.id
  vehicleId: string // FK → Vehicle.id
  date: Date
  offeredFare: number
  estimatedDistance: number
  deadheadDistance: number
  estimatedDuration: number
  deadheadDuration: number
  passengerRating?: number
  notes?: string
}
```

---

### SavedProfitGoal _(new)_

```typescript
// src/domain/entities/saved-profit-goal.ts
export type SavedProfitGoal = {
  id: string
  name: string
  targetAmount: number
  period?: 'daily' | 'weekly' | 'monthly' | 'custom'
  tags?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

---

### PlatformProfitGoal _(new)_

```typescript
// src/domain/entities/platform-profit-goal.ts
export type PlatformProfitGoal = {
  id: string
  platformId: string // FK → TripPlatform.id
  targetAmount: number
  tags?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

---

### UserSettings _(new)_

```typescript
// src/domain/entities/user-settings.ts
export type UserSettings = {
  id: string // always 'default' in single-user MVP
  userId: string // FK → User.id
  preferredUnits: 'km/l' | 'mpg' | 'l/100km'
  currency: string // ISO 4217, default 'BRL'
  displayPreferences: {
    showCosts: boolean
    showProfits: boolean
    showMaintenance: boolean
    showReminders: boolean
  }
  starredTool?:
    | 'costs'
    | 'profits'
    | 'maintenance'
    | 'reminders'
    | 'trips'
    | 'fuel'
  tripOfferPill?: {
    orangeThresholdPct: number
    blueThresholdPct: number
    ratingThresholds?: {
      redBelow: number
      orangeBelow: number
      blueAbove: number
    }
  }
  createdAt: Date
  updatedAt: Date
}

export const DEFAULT_USER_SETTINGS: Omit<
  UserSettings,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
> = {
  preferredUnits: 'km/l',
  currency: 'BRL',
  displayPreferences: {
    showCosts: true,
    showProfits: true,
    showMaintenance: true,
    showReminders: true,
  },
}
```

---

## Pure Domain Functions

> Live in `src/domain/entities/` alongside the types they operate on.
> No external imports allowed.

### calculateProfit

```typescript
// src/domain/entities/profit-calculator.ts
type ProfitTarget =
  | { type: 'percentage'; value: number }
  | { type: 'amount'; value: number }

type ProfitCalculationInput = {
  distance: number
  deadheadDistance?: number
  averageConsumption: number
  fuelPrice: number
  profitTarget: ProfitTarget
  tolls?: number
}

export function calculateProfit(input: ProfitCalculationInput): number
```

### calculateAverageConsumption

```typescript
// src/domain/entities/fuel-consumption-record.ts  (co-located)
type FuelConsumptionCalculationInput = {
  startMileage: number
  endMileage: number
  fuelAdded: number
  fuelGaugeMeasurement?: FuelGaugeMeasurement
  fuelGaugeTotalCapacity?: number
}

export function calculateAverageConsumption(
  input: FuelConsumptionCalculationInput
): number
// Throws ValidationError when distance <= 0 or fuelAdded <= 0
```

### calculateFuelLiters

```typescript
type FuelCostInput = { amountSpent: number; pricePerLiter: number }
export function calculateFuelLiters(input: FuelCostInput): number
// Throws ValidationError when pricePerLiter <= 0
```

### createTripFromOffer

```typescript
// src/domain/entities/trip-offer-record.ts  (co-located)
export function createTripFromOffer(
  offer: TripOfferRecord,
  actualEarnings: number
): Trip
```

### evaluateTripOfferPill

```typescript
// src/domain/entities/trip-offer-record.ts  (co-located)
export type TripOfferPillColor = 'blue' | 'green' | 'orange' | 'red' | 'neutral'

export type TripOfferPillState = {
  estimatedProfit: number
  totalDuration: number
  goalPct: number | null
  color: TripOfferPillColor
  passengerRating: number | null
  ratingColor: TripOfferPillColor
}

export function evaluateTripOfferPill(
  input: TripOfferPillEvalInput
): TripOfferPillState
```

---

## Zod Validation Schemas

> Live in `src/domain/validations/`. Each new entity gets a `Create<Entity>Schema` and, where appropriate, an `Update<Entity>Schema`.

| Entity                | Schema File                  | Key Validations                                                    |
| --------------------- | ---------------------------- | ------------------------------------------------------------------ |
| FuelType              | `fuel-type.ts`               | `name` min 1                                                       |
| VehicleType           | `vehicle-type.ts`            | `name` min 1                                                       |
| TripPlatform          | `trip-platform.ts`           | `name` min 1                                                       |
| Vehicle (update)      | `vehicle.ts`                 | `brand`, `model` min 1; `year` int 1900–2100; FKs present          |
| Cost (update)         | `cost.ts`                    | `recurrence.rule` valid RRULE prefix; `endDate >= date`            |
| FuelPriceRecord       | `fuel-price-record.ts`       | `pricePerLiter > 0`                                                |
| FuelConsumptionRecord | `fuel-consumption-record.ts` | `endMileage > startMileage`; `fuelAdded > 0`                       |
| MileageRecord         | `mileage-record.ts`          | `mileage > 0`                                                      |
| Profit                | `profit.ts`                  | `amount > 0`                                                       |
| Reminder              | `reminder.ts`                | `message` min 1; `alarm` boolean                                   |
| Maintenance           | `maintenance.ts`             | `estimatedCost > 0`; trigger union validated                       |
| SpecialDay            | `special-day.ts`             | `source='official'` only for `type='holiday'/'optional'`           |
| PlannedAbsence        | `planned-absence.ts`         | `vacation` requires `endDate >= date`; `day_off` forbids `endDate` |
| TripOfferRecord       | `trip-offer-record.ts`       | distances/durations ≥ 0; `passengerRating` 0–5                     |
| SavedProfitGoal       | `saved-profit-goal.ts`       | `targetAmount > 0`; `name` min 1                                   |
| PlatformProfitGoal    | `platform-profit-goal.ts`    | `targetAmount > 0`                                                 |
| UserSettings          | `user-settings.ts`           | `preferredUnits` enum; `currency` ISO 4217 (min 3 chars)           |

---

## Repository Interfaces

> Live in `src/domain/repositories/`. All methods return `Promise<T>` and throw typed errors.

| Interface                          | File                                              | Methods                                                                   |
| ---------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| `IFuelTypeRepository`              | `fuel-type.interface.repository.ts`               | `create`, `findById`, `findAll`, `update`, `delete`                       |
| `IVehicleTypeRepository`           | `vehicle-type.interface.repository.ts`            | `create`, `findById`, `findAll`, `update`, `delete`                       |
| `ITripPlatformRepository`          | `trip-platform.interface.repository.ts`           | `create`, `findById`, `findAll`, `update`, `delete`                       |
| `IVehicleRepository` (update)      | `vehicle.interface.repository.ts`                 | add `update` (was missing in 001)                                         |
| `ITripRepository` (update)         | `trip.interface.repository.ts`                    | no new methods; `findByFilter` gains `platformId` as filter key           |
| `ICostRepository` (update)         | `cost.interface.repository.ts`                    | add `findByDateRange(from, to): Promise<Cost[]>`                          |
| `IFuelPriceRecordRepository`       | `fuel-price-record.interface.repository.ts`       | `create`, `findLatestByFuelType`, `findAll`, `delete`                     |
| `IFuelConsumptionRecordRepository` | `fuel-consumption-record.interface.repository.ts` | `create`, `findById`, `findByVehicle`, `findAll`, `delete`                |
| `IMileageRecordRepository`         | `mileage-record.interface.repository.ts`          | `create`, `findLatestByVehicle`, `findByVehicle`, `delete`                |
| `IProfitRepository`                | `profit.interface.repository.ts`                  | `create`, `findById`, `findAll`, `findByDateRange`, `update`, `delete`    |
| `IWorkSessionRepository` (update)  | `work-session.interface.repository.ts`            | add `update(session: WorkSession): Promise<WorkSession>`                  |
| `IReminderRepository`              | `reminder.interface.repository.ts`                | `create`, `findById`, `findAll`, `update`, `delete`                       |
| `IMaintenanceRepository`           | `maintenance.interface.repository.ts`             | `create`, `findById`, `findByVehicle`, `findPending`, `update`, `delete`  |
| `ISpecialDayRepository`            | `special-day.interface.repository.ts`             | `create`, `findByDateRange`, `findByYear`, `upsertOfficial`, `delete`     |
| `IPlannedAbsenceRepository`        | `planned-absence.interface.repository.ts`         | `create`, `findById`, `findByDateRange`, `update`, `delete`               |
| `ITripOfferRecordRepository`       | `trip-offer-record.interface.repository.ts`       | `create`, `findById`, `findAll`, `findByDateRange`, `delete`              |
| `ISavedProfitGoalRepository`       | `saved-profit-goal.interface.repository.ts`       | `create`, `findById`, `findAll`, `update`, `delete`                       |
| `IPlatformProfitGoalRepository`    | `platform-profit-goal.interface.repository.ts`    | `create`, `findById`, `findByPlatform`, `update`, `delete`                |
| `IUserSettingsRepository`          | `user-settings.interface.repository.ts`           | `get(): Promise<UserSettings>`, `upsert(settings): Promise<UserSettings>` |

---

## Drizzle Schemas (SQLite)

> Live in `src/infra/db/schema/`.

### New tables

```typescript
// fuel-types.drizzle-schema.ts
export const fuelTypes = sqliteTable('fuel_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags'), // JSON array
})

// vehicle-types.drizzle-schema.ts
export const vehicleTypes = sqliteTable('vehicle_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags'),
})

// trip-platforms.drizzle-schema.ts
export const tripPlatforms = sqliteTable('trip_platforms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags'),
})

// mileage-records.drizzle-schema.ts
export const mileageRecords = sqliteTable('mileage_records', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  mileage: real('mileage').notNull(),
  notes: text('notes'),
})

// fuel-price-records.drizzle-schema.ts
export const fuelPriceRecords = sqliteTable('fuel_price_records', {
  id: text('id').primaryKey(),
  fuelTypeId: text('fuel_type_id')
    .notNull()
    .references(() => fuelTypes.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  pricePerLiter: real('price_per_liter').notNull(),
  notes: text('notes'),
})

// fuel-consumption-records.drizzle-schema.ts
export const fuelConsumptionRecords = sqliteTable('fuel_consumption_records', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  fuelTypeId: text('fuel_type_id')
    .notNull()
    .references(() => fuelTypes.id),
  startMileage: real('start_mileage').notNull(),
  endMileage: real('end_mileage').notNull(),
  fuelAdded: real('fuel_added').notNull(),
  averageConsumption: real('average_consumption').notNull(),
  gaugeBeforeLevel: real('gauge_before_level'),
  gaugeAfterLevel: real('gauge_after_level'),
  gaugeTotalCapacity: real('gauge_total_capacity'),
  tags: text('tags'),
  notes: text('notes'),
})

// profits.drizzle-schema.ts
export const profits = sqliteTable('profits', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  amount: real('amount').notNull(),
  platformId: text('platform_id')
    .notNull()
    .references(() => tripPlatforms.id),
  description: text('description'),
  tags: text('tags'),
})

// reminders.drizzle-schema.ts
export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  message: text('message').notNull(),
  alarm: integer('alarm', { mode: 'boolean' }).notNull().default(false),
  recurrenceRule: text('recurrence_rule'),
  recurrenceEndDate: integer('recurrence_end_date', { mode: 'timestamp' }),
  recurrenceExceptions: text('recurrence_exceptions'), // JSON array of ISO timestamps
  notes: text('notes'),
  tags: text('tags'),
})

// maintenances.drizzle-schema.ts
export const maintenances = sqliteTable('maintenances', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  triggerType: text('trigger_type').notNull(), // 'date' | 'mileage'
  triggerDate: integer('trigger_date', { mode: 'timestamp' }),
  triggerMileage: real('trigger_mileage'),
  estimatedCost: real('estimated_cost').notNull(),
  actualCost: real('actual_cost'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  tags: text('tags'),
  notes: text('notes'),
})

// special-days.drizzle-schema.ts
export const specialDays = sqliteTable('special_days', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  type: text('type').notNull(), // 'holiday' | 'optional' | 'event'
  description: text('description').notNull(),
  source: text('source').notNull(), // 'official' | 'custom'
  tags: text('tags'),
  notes: text('notes'),
})

// planned-absences.drizzle-schema.ts
export const plannedAbsences = sqliteTable('planned_absences', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  type: text('type').notNull(), // 'day_off' | 'vacation'
  workedDays: text('worked_days'), // JSON array of ISO timestamps
  cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
  notes: text('notes'),
  tags: text('tags'),
})

// trip-offer-records.drizzle-schema.ts
export const tripOfferRecords = sqliteTable('trip_offer_records', {
  id: text('id').primaryKey(),
  platformId: text('platform_id')
    .notNull()
    .references(() => tripPlatforms.id),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  offeredFare: real('offered_fare').notNull(),
  estimatedDistance: real('estimated_distance').notNull(),
  deadheadDistance: real('deadhead_distance').notNull().default(0),
  estimatedDuration: integer('estimated_duration').notNull(),
  deadheadDuration: integer('deadhead_duration').notNull().default(0),
  passengerRating: real('passenger_rating'),
  notes: text('notes'),
})

// saved-profit-goals.drizzle-schema.ts
export const savedProfitGoals = sqliteTable('saved_profit_goals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  targetAmount: real('target_amount').notNull(),
  period: text('period'), // 'daily' | 'weekly' | 'monthly' | 'custom' | null
  tags: text('tags'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// platform-profit-goals.drizzle-schema.ts
export const platformProfitGoals = sqliteTable('platform_profit_goals', {
  id: text('id').primaryKey(),
  platformId: text('platform_id')
    .notNull()
    .references(() => tripPlatforms.id),
  targetAmount: real('target_amount').notNull(),
  tags: text('tags'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// user-settings.drizzle-schema.ts
export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey(), // always 'default'
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  preferredUnits: text('preferred_units').notNull().default('km/l'),
  currency: text('currency').notNull().default('BRL'),
  displayPreferences: text('display_preferences').notNull(), // JSON
  starredTool: text('starred_tool'),
  tripOfferPill: text('trip_offer_pill'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
```

### Modified tables (migrations required)

```typescript
// vehicles.drizzle-schema.ts — add columns
brand: text('brand').notNull().default(''),       // migration default
model: text('model').notNull().default(''),
year: integer('year').notNull().default(2000),
fuelTypeId: text('fuel_type_id').references(() => fuelTypes.id),
typeId: text('type_id').references(() => vehicleTypes.id),
color: text('color'),
notes: text('notes'),

// trips.drizzle-schema.ts — rename column + FK
// platform TEXT → platform_id TEXT REFERENCES trip_platforms(id)
// Migration: multi-step (see research.md R-003)
platformId: text('platform_id').notNull().references(() => tripPlatforms.id),

// costs.drizzle-schema.ts — add columns
description: text('description'),
recurrenceRule: text('recurrence_rule'),
recurrenceEndDate: integer('recurrence_end_date', { mode: 'timestamp' }),
recurrenceExceptions: text('recurrence_exceptions'),  // JSON
tags: text('tags'),  // JSON array
```

---

## Application Services (non-domain)

| Service                | File                                                  | Responsibility                                                          |
| ---------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `RecurrenceService`    | `src/application/services/recurrence.service.ts`      | Wraps `rrule.js`; exposes `getOccurrences(rec, after?, before?)`        |
| `HolidaySyncService`   | `src/application/services/holiday-sync.service.ts`    | Fetches BrasilAPI, maps to `SpecialDay[]`, calls `upsertOfficial`       |
| `TripOfferEvalService` | `src/application/services/trip-offer-eval.service.ts` | Resolves active goal + latest fuel price, calls `evaluateTripOfferPill` |

---

## Use Cases (new / updated)

> Live in `src/application/use-cases/`. Each file exports one class with an `execute()` method.

| Use Case                   | File                                                  | Description                                               |
| -------------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| `CreateFuelType`           | `fuel-type/create-fuel-type.ts`                       |                                                           |
| `UpdateFuelType`           | `fuel-type/update-fuel-type.ts`                       |                                                           |
| `DeleteFuelType`           | `fuel-type/delete-fuel-type.ts`                       |                                                           |
| `CreateVehicleType`        | `vehicle-type/create-vehicle-type.ts`                 |                                                           |
| `UpdateVehicleType`        | `vehicle-type/update-vehicle-type.ts`                 |                                                           |
| `DeleteVehicleType`        | `vehicle-type/delete-vehicle-type.ts`                 |                                                           |
| `CreateTripPlatform`       | `trip-platform/create-trip-platform.ts`               |                                                           |
| `UpdateTripPlatform`       | `trip-platform/update-trip-platform.ts`               |                                                           |
| `DeleteTripPlatform`       | `trip-platform/delete-trip-platform.ts`               |                                                           |
| `CreateMileageRecord`      | `mileage-record/create-mileage-record.ts`             |                                                           |
| `GetLastMileageRecord`     | `mileage-record/get-last-mileage-record.ts`           | Supports form pre-fill (FR-005)                           |
| `RecordFuelPrice`          | `fuel-price-record/record-fuel-price.ts`              |                                                           |
| `GetLatestFuelPrice`       | `fuel-price-record/get-latest-fuel-price.ts`          | Used by TripOfferEvalService                              |
| `RecordFuelConsumption`    | `fuel-consumption-record/record-fuel-consumption.ts`  | Calls `calculateAverageConsumption` before persist        |
| `CreateProfit`             | `profit/create-profit.ts`                             |                                                           |
| `UpdateProfit`             | `profit/update-profit.ts`                             |                                                           |
| `DeleteProfit`             | `profit/delete-profit.ts`                             |                                                           |
| `UpdateWorkSession`        | `work-session/update-work-session.ts`                 | Corrects startTime/endTime (FR-014)                       |
| `CreateReminder`           | `reminder/create-reminder.ts`                         | Schedules notification when alarm=true                    |
| `UpdateReminder`           | `reminder/update-reminder.ts`                         |                                                           |
| `DeleteReminder`           | `reminder/delete-reminder.ts`                         |                                                           |
| `CreateMaintenance`        | `maintenance/create-maintenance.ts`                   |                                                           |
| `UpdateMaintenance`        | `maintenance/update-maintenance.ts`                   | Handles completedAt + actualCost                          |
| `DeleteMaintenance`        | `maintenance/delete-maintenance.ts`                   |                                                           |
| `GetPendingMaintenances`   | `maintenance/get-pending-maintenances.ts`             |                                                           |
| `SyncOfficialHolidays`     | `special-day/sync-official-holidays.ts`               | Calls HolidaySyncService (FR-020)                         |
| `CreateSpecialDay`         | `special-day/create-special-day.ts`                   | Only source='custom' allowed                              |
| `DeleteSpecialDay`         | `special-day/delete-special-day.ts`                   | Blocked for source='official'                             |
| `CreatePlannedAbsence`     | `planned-absence/create-planned-absence.ts`           |                                                           |
| `UpdatePlannedAbsence`     | `planned-absence/update-planned-absence.ts`           |                                                           |
| `DeletePlannedAbsence`     | `planned-absence/delete-planned-absence.ts`           |                                                           |
| `RecordTripOffer`          | `trip-offer-record/record-trip-offer.ts`              |                                                           |
| `EvaluateTripOffer`        | `trip-offer-record/evaluate-trip-offer.ts`            | Orchestrates TripOfferEvalService + evaluateTripOfferPill |
| `CreateTripFromOffer`      | `trip-offer-record/create-trip-from-offer.ts`         | Calls domain function `createTripFromOffer`               |
| `CreateSavedProfitGoal`    | `saved-profit-goal/create-saved-profit-goal.ts`       |                                                           |
| `UpdateSavedProfitGoal`    | `saved-profit-goal/update-saved-profit-goal.ts`       |                                                           |
| `DeleteSavedProfitGoal`    | `saved-profit-goal/delete-saved-profit-goal.ts`       |                                                           |
| `CreatePlatformProfitGoal` | `platform-profit-goal/create-platform-profit-goal.ts` |                                                           |
| `UpdatePlatformProfitGoal` | `platform-profit-goal/update-platform-profit-goal.ts` |                                                           |
| `DeletePlatformProfitGoal` | `platform-profit-goal/delete-platform-profit-goal.ts` |                                                           |
| `GetUserSettings`          | `user-settings/get-user-settings.ts`                  | Returns default if absent (FR-030)                        |
| `UpdateUserSettings`       | `user-settings/update-user-settings.ts`               | Upserts by id='default'                                   |

---

## State Transitions

### Maintenance lifecycle

```
created (completedAt = null)
  └── UpdateMaintenance(completedAt, actualCost) → completed
```

### PlannedAbsence lifecycle

```
active (cancelledAt = null)
  ├── UpdatePlannedAbsence(workedDays) → partial work recorded (still active)
  └── UpdatePlannedAbsence(cancelledAt) → cancelled
```

### Trip lifecycle (with offer origin)

```
TripOfferRecord created
  └── CreateTripFromOffer(offer, actualEarnings) → Trip created (pre-filled)
```
