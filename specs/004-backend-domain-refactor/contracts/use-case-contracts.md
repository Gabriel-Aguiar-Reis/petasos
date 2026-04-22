# Use Case Contracts: Backend Domain Refactor

**Feature**: `004-backend-domain-refactor`
**Date**: 2026-04-20
**Format**: Input/Output types + error taxonomy per use case

---

> These contracts define the boundary between the application layer (use cases) and consumers (React Query hooks, services, tests). All types are TypeScript-strict; no `any`.

---

## Error Taxonomy (unchanged from 001)

```typescript
ValidationError // invalid input — thrown before any storage operation
StorageError // SQLite read/write failure
NotFoundError // entity not found by id (findById / update / delete)
ConflictError // e.g. FK constraint violation, duplicate name
```

---

## Lookup Entities: FuelType / VehicleType / TripPlatform

All three follow the same CRUD contract. Shown once for `FuelType`.

```typescript
// CreateFuelType
input:  { name: string; description?: string; tags?: string[] }
output: FuelType
errors: [ValidationError, StorageError]

// UpdateFuelType
input:  { id: string; name?: string; description?: string; tags?: string[] }
output: FuelType
errors: [ValidationError, NotFoundError, StorageError]

// DeleteFuelType
input:  { id: string }
output: void
errors: [NotFoundError, ConflictError /* FK in use */, StorageError]

// GetAllFuelTypes
input:  void
output: FuelType[]
errors: [StorageError]
```

Replicate contract for `VehicleType` and `TripPlatform`.

---

## Vehicle

```typescript
// UpdateVehicle (extends existing 001 contract)
input: {
  id: string
  name?: string
  plate?: string
  brand?: string
  model?: string
  year?: number
  fuelTypeId?: string
  typeId?: string
  color?: string
  notes?: string
}
output: Vehicle
errors: [ValidationError, NotFoundError, StorageError]
```

---

## MileageRecord

```typescript
// CreateMileageRecord
input:  { vehicleId: string; mileage: number; date?: Date; notes?: string }
output: MileageRecord
errors: [ValidationError, NotFoundError /* vehicle */, StorageError]

// GetLastMileageRecord
input:  { vehicleId: string }
output: MileageRecord | null
errors: [StorageError]
```

---

## FuelPriceRecord

```typescript
// RecordFuelPrice
input:  { fuelTypeId: string; pricePerLiter: number; date?: Date; notes?: string }
output: FuelPriceRecord
errors: [ValidationError, NotFoundError /* fuelType */, StorageError]

// GetLatestFuelPrice
input:  { fuelTypeId: string }
output: FuelPriceRecord | null
errors: [StorageError]
```

---

## FuelConsumptionRecord

```typescript
// RecordFuelConsumption
input: {
  vehicleId: string
  fuelTypeId: string
  startMileage: number
  endMileage: number
  fuelAdded: number
  date?: Date
  fuelGaugeMeasurement?: { before: number; after: number }
  fuelGaugeTotalCapacity?: number
  tags?: string[]
  notes?: string
}
output: FuelConsumptionRecord  // averageConsumption computed before persist
errors: [ValidationError, NotFoundError /* vehicle/fuelType */, StorageError]
```

---

## Cost (updated)

```typescript
// CreateCost (extends 001 — adds recurrence/tags/description)
input: {
  amount: number
  category: string
  date?: Date
  description?: string
  recurrence?: { rule: string; endDate?: Date; exceptions?: Date[] }
  tags?: string[]
}
output: Cost
errors: [ValidationError, StorageError]

// UpdateCost
input: {
  id: string
  amount?: number
  category?: string
  date?: Date
  description?: string
  recurrence?: { rule: string; endDate?: Date; exceptions?: Date[] } | null
  tags?: string[]
}
output: Cost
errors: [ValidationError, NotFoundError, StorageError]

// GetCostsByDateRange
input:  { from: Date; to: Date }
output: Cost[]   // includes one-time costs + expanded recurring occurrences
errors: [StorageError]
```

---

## Profit

```typescript
// CreateProfit
input:  { amount: number; platformId: string; date?: Date; description?: string; tags?: string[] }
output: Profit
errors: [ValidationError, NotFoundError /* platform */, StorageError]

// UpdateProfit
input:  { id: string; amount?: number; platformId?: string; date?: Date; description?: string; tags?: string[] }
output: Profit
errors: [ValidationError, NotFoundError, StorageError]

// DeleteProfit
input:  { id: string }
output: void
errors: [NotFoundError, StorageError]
```

---

## WorkSession (updated)

```typescript
// UpdateWorkSession  (new use case — adds to 001 contract)
input:  { id: string; startTime?: Date; endTime?: Date | null }
output: WorkSession
errors: [ValidationError, NotFoundError, StorageError]
// Constraint: startTime must be < endTime when both provided
```

---

## Reminder

```typescript
// CreateReminder
input: {
  date: Date
  message: string
  alarm: boolean
  notes?: string
  recurrence?: { rule: string; endDate?: Date; exceptions?: Date[] }
  tags?: string[]
}
output: Reminder
errors: [ValidationError, StorageError]

// UpdateReminder
input: { id: string; date?: Date; message?: string; alarm?: boolean; notes?: string; recurrence?: { rule: string; ... } | null; tags?: string[] }
output: Reminder
errors: [ValidationError, NotFoundError, StorageError]

// DeleteReminder
input:  { id: string }
output: void
errors: [NotFoundError, StorageError]
```

---

## Maintenance

```typescript
// CreateMaintenance
input: {
  vehicleId: string
  name: string
  description: string
  trigger: { type: 'date'; date: Date } | { type: 'mileage'; mileage: number }
  estimatedCost: number
  tags?: string[]
  notes?: string
}
output: Maintenance
errors: [ValidationError, NotFoundError /* vehicle */, StorageError]

// UpdateMaintenance
input: {
  id: string
  name?: string
  description?: string
  estimatedCost?: number
  actualCost?: number
  completedAt?: Date
  tags?: string[]
  notes?: string
}
output: Maintenance
errors: [ValidationError, NotFoundError, StorageError]

// DeleteMaintenance
input:  { id: string }
output: void
errors: [NotFoundError, StorageError]

// GetPendingMaintenances
input:  { vehicleId?: string }
output: Maintenance[]  // completedAt = null only
errors: [StorageError]
```

---

## SpecialDay

```typescript
// SyncOfficialHolidays
input:  { year: number }
output: { synced: number; skipped: number }  // skipped = already existed
errors: [StorageError]  // network failure → silent retry; no error surfaced to caller

// CreateSpecialDay  (custom only)
input:  { date: Date; type: 'event'; description: string; tags?: string[]; notes?: string }
output: SpecialDay
errors: [ValidationError, StorageError]

// DeleteSpecialDay
input:  { id: string }
output: void
errors: [NotFoundError, ConflictError /* source='official' cannot be deleted */, StorageError]
```

---

## PlannedAbsence

```typescript
// CreatePlannedAbsence
input: {
  date: Date
  type: 'day_off' | 'vacation'
  endDate?: Date     // required for 'vacation'
  notes?: string
  tags?: string[]
}
output: PlannedAbsence
errors: [ValidationError, StorageError]

// UpdatePlannedAbsence
input: {
  id: string
  workedDays?: Date[]
  cancelledAt?: Date
  notes?: string
  tags?: string[]
}
output: PlannedAbsence
errors: [ValidationError, NotFoundError, StorageError]

// DeletePlannedAbsence
input:  { id: string }
output: void
errors: [NotFoundError, StorageError]
```

---

## TripOfferRecord

```typescript
// RecordTripOffer
input: {
  platformId: string
  vehicleId: string
  offeredFare: number
  estimatedDistance: number
  deadheadDistance: number
  estimatedDuration: number
  deadheadDuration: number
  date?: Date
  passengerRating?: number
  notes?: string
}
output: TripOfferRecord
errors: [ValidationError, NotFoundError /* platform/vehicle */, StorageError]

// EvaluateTripOffer
input:  { offerId: string; tolls?: number }
output: TripOfferPillState
errors: [NotFoundError, StorageError]
// Internally resolves: vehicle averageConsumption, latest fuelPrice, active SavedProfitGoal, UserSettings thresholds

// CreateTripFromOffer
input:  { offerId: string; actualEarnings: number }
output: Trip
errors: [ValidationError, NotFoundError, StorageError]
```

---

## SavedProfitGoal

```typescript
// CreateSavedProfitGoal
input:  { name: string; targetAmount: number; period?: 'daily' | 'weekly' | 'monthly' | 'custom'; tags?: string[]; notes?: string }
output: SavedProfitGoal
errors: [ValidationError, StorageError]

// UpdateSavedProfitGoal
input:  { id: string; name?: string; targetAmount?: number; period?: string; tags?: string[]; notes?: string }
output: SavedProfitGoal
errors: [ValidationError, NotFoundError, StorageError]

// DeleteSavedProfitGoal
input:  { id: string }
output: void
errors: [NotFoundError, StorageError]
```

---

## PlatformProfitGoal

```typescript
// CreatePlatformProfitGoal
input:  { platformId: string; targetAmount: number; tags?: string[]; notes?: string }
output: PlatformProfitGoal
errors: [ValidationError, NotFoundError /* platform */, StorageError]

// UpdatePlatformProfitGoal
input:  { id: string; targetAmount?: number; tags?: string[]; notes?: string }
output: PlatformProfitGoal
errors: [ValidationError, NotFoundError, StorageError]

// DeletePlatformProfitGoal
input:  { id: string }
output: void
errors: [NotFoundError, StorageError]
```

---

## UserSettings

```typescript
// GetUserSettings
input:  void
output: UserSettings   // returns DEFAULT_USER_SETTINGS object (not persisted) if row absent
errors: [StorageError]

// UpdateUserSettings
input: {
  preferredUnits?: 'km/l' | 'mpg' | 'l/100km'
  currency?: string
  displayPreferences?: { showCosts?: boolean; showProfits?: boolean; showMaintenance?: boolean; showReminders?: boolean }
  starredTool?: 'costs' | 'profits' | 'maintenance' | 'reminders' | 'trips' | 'fuel' | null
  tripOfferPill?: { orangeThresholdPct: number; blueThresholdPct: number; ratingThresholds?: { redBelow: number; orangeBelow: number; blueAbove: number } } | null
}
output: UserSettings
errors: [ValidationError, StorageError]
```
