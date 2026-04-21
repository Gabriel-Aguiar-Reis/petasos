# Tasks: Backend Domain Refactor — Extended Domain Model & Pure Functions

**Input**: Design documents from `/specs/004-backend-domain-refactor/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no open dependencies)
- **[Story]**: User story this task belongs to (US1–US9)
- Lookup entities (FuelType, VehicleType, TripPlatform) are **foundational** — no story label

---

## Phase 1: Setup

**Purpose**: Add new dependency and configure domain purity enforcement before any entity work begins.

- [ ] T001 Install `rrule` npm package (`npm install rrule`) and verify zero domain imports rule is not yet broken
- [ ] T002 [P] Add `no-restricted-imports` ESLint rule for `src/domain/**` in `.eslintrc.js` blocking `expo*`, `react-native*`, `drizzle-orm*`, `rrule*`, `@/src/infra/*`, `@/src/components/*`

**Checkpoint**: rrule installed; domain purity rule active.

---

## Phase 2: Foundational — Lookup Entities + Recurrence Primitive

**Purpose**: Create the shared types and lookup entities that multiple user stories depend on. These MUST be complete before US1–US9 can be implemented.

**⚠️ CRITICAL**: Vehicle, Trip, Profit, TripOfferRecord, Goals all have FK dependencies on these entities.

### Recurrence primitive

- [ ] T003 Create `src/domain/entities/recurrence.ts` exporting `RecurrenceRule` type alias and `Recurrence` type

### FuelType

- [ ] T004 [P] Create `src/domain/entities/fuel-type.ts` with `FuelType` type (`id`, `name`, optional `description`, `tags`)
- [ ] T005 [P] Create `src/domain/validations/fuel-type.ts` with `CreateFuelTypeSchema` and `UpdateFuelTypeSchema` (Zod)
- [ ] T006 [P] Create `src/domain/repositories/fuel-type.interface.repository.ts` with `IFuelTypeRepository` interface (create, findById, findAll, update, delete)
- [ ] T007 [P] Create `src/infra/db/schema/fuel-types.drizzle-schema.ts` with `fuelTypes` table (`id`, `name`, `description`, `tags` as JSON text)
- [ ] T008 Create `src/infra/repositories/fuel-type.drizzle-repository.ts` implementing `IFuelTypeRepository`
- [ ] T009 [P] Create use cases in `src/application/use-cases/fuel-type/`: `create-fuel-type.ts`, `update-fuel-type.ts`, `delete-fuel-type.ts`, `get-all-fuel-types.ts`

### VehicleType

- [ ] T010 [P] Create `src/domain/entities/vehicle-type.ts` with `VehicleType` type
- [ ] T011 [P] Create `src/domain/validations/vehicle-type.ts` with `CreateVehicleTypeSchema` and `UpdateVehicleTypeSchema`
- [ ] T012 [P] Create `src/domain/repositories/vehicle-type.interface.repository.ts` with `IVehicleTypeRepository`
- [ ] T013 [P] Create `src/infra/db/schema/vehicle-types.drizzle-schema.ts` with `vehicleTypes` table
- [ ] T014 Create `src/infra/repositories/vehicle-type.drizzle-repository.ts` implementing `IVehicleTypeRepository`
- [ ] T015 [P] Create use cases in `src/application/use-cases/vehicle-type/`: `create-vehicle-type.ts`, `update-vehicle-type.ts`, `delete-vehicle-type.ts`, `get-all-vehicle-types.ts`

### TripPlatform

- [ ] T016 [P] Create `src/domain/entities/trip-platform.ts` with `TripPlatform` type
- [ ] T017 [P] Create `src/domain/validations/trip-platform.ts` with `CreateTripPlatformSchema` and `UpdateTripPlatformSchema`
- [ ] T018 [P] Create `src/domain/repositories/trip-platform.interface.repository.ts` with `ITripPlatformRepository`
- [ ] T019 [P] Create `src/infra/db/schema/trip-platforms.drizzle-schema.ts` with `tripPlatforms` table
- [ ] T020 Create `src/infra/repositories/trip-platform.drizzle-repository.ts` implementing `ITripPlatformRepository`
- [ ] T021 [P] Create use cases in `src/application/use-cases/trip-platform/`: `create-trip-platform.ts`, `update-trip-platform.ts`, `delete-trip-platform.ts`, `get-all-trip-platforms.ts`

### Schema barrel + first migration

- [ ] T022 Add exports for `fuel-types`, `vehicle-types`, `trip-platforms` to `src/infra/db/schema/index.ts`
- [ ] T023 Run `npx drizzle-kit generate` to produce migration for `fuel_types`, `vehicle_types`, `trip_platforms` tables

**Checkpoint**: All lookup CRUD works via in-memory fakes. Migration generated.

---

## Phase 3: User Story 1 — Register Vehicle with Full Details (Priority: P1) 🎯 MVP

**Goal**: Driver registers a vehicle with brand/model/year/fuelType/vehicleType; system pre-fills last mileage.

**Independent Test**: Create FuelType + VehicleType, create Vehicle with all new fields, persist, retrieve, assert all fields intact. Create 2 MileageRecords, call GetLastMileageRecord, assert highest mileage returned.

### Vehicle entity + schema update

- [ ] T024 [US1] Update `src/domain/entities/vehicle.ts` — add `brand`, `model`, `year` (required), `fuelTypeId`, `typeId` (required FKs), `color`, `notes` (optional); make `plate` non-nullable
- [ ] T025 [P] [US1] Update `src/domain/validations/vehicle.ts` — add new required fields to `CreateVehicleSchema`; create `UpdateVehicleSchema` including new fields
- [ ] T026 [P] [US1] Update `src/infra/db/schema/vehicles.drizzle-schema.ts` — add `brand`, `model`, `year`, `fuel_type_id` (FK), `type_id` (FK), `color`, `notes` columns
- [ ] T027 [US1] Update `src/domain/repositories/vehicle.interface.repository.ts` — add `update(vehicle: Vehicle): Promise<Vehicle>`
- [ ] T028 [US1] Update `src/infra/repositories/vehicle.drizzle-repository.ts` — implement `update()` method

### MileageRecord

- [ ] T029 [P] [US1] Create `src/domain/entities/mileage-record.ts` with `MileageRecord` type
- [ ] T030 [P] [US1] Create `src/domain/validations/mileage-record.ts` with `CreateMileageRecordSchema` (`vehicleId`, `mileage > 0`, optional `date`, `notes`)
- [ ] T031 [P] [US1] Create `src/domain/repositories/mileage-record.interface.repository.ts` with `IMileageRecordRepository` (create, findLatestByVehicle, findByVehicle, delete)
- [ ] T032 [P] [US1] Create `src/infra/db/schema/mileage-records.drizzle-schema.ts` with `mileageRecords` table (FK → `vehicles.id`)
- [ ] T033 [US1] Create `src/infra/repositories/mileage-record.drizzle-repository.ts` implementing `IMileageRecordRepository`

### Use cases

- [ ] T034 [P] [US1] Create `src/application/use-cases/vehicle/update-vehicle.ts` use case (validates input, calls `vehicleRepo.update()`)
- [ ] T035 [P] [US1] Create `src/application/use-cases/mileage-record/create-mileage-record.ts` use case
- [ ] T036 [P] [US1] Create `src/application/use-cases/mileage-record/get-last-mileage-record.ts` use case returning `MileageRecord | null`

### Migration + tests

- [ ] T037 [US1] Add exports for `mileage-records`, updated `vehicles` to `src/infra/db/schema/index.ts` and run `npx drizzle-kit generate` for vehicle column additions + mileage_records table
- [ ] T038 [US1] Create `tests/fakes/fake-mileage-record.repository.ts` in-memory fake implementing `IMileageRecordRepository`
- [ ] T039 [US1] Update `tests/vehicle.test.ts` — add test cases for new required fields and `ValidationError` on missing brand/model/year/fuelTypeId/typeId
- [ ] T040 [US1] Create `tests/mileage-record.test.ts` — test `CreateMileageRecord`, `GetLastMileageRecord` (returns latest by mileage value; returns null when none exist)

**Checkpoint**: `npx jest tests/vehicle.test.ts tests/mileage-record.test.ts` passes.

---

## Phase 4: User Story 2 — Evaluate Trip Offer in Real Time (Priority: P1) 🎯 MVP

**Goal**: Pure domain functions compute trip offer pill state; TripOfferRecord persisted; app service orchestrates context resolution.

**Independent Test**: Call `evaluateTripOfferPill` with known inputs — assert all 5 color zones. Call `createTripFromOffer` — assert returned Trip fields. Call `calculateProfit` — assert minimum price calculation.

### Pure domain functions

- [x] T041 [P] [US2] Create `src/domain/entities/profit-calculator.ts` — export `calculateProfit(input: ProfitCalculationInput): number` and `calculateFuelLiters(input: FuelCostInput): number` throwing `ValidationError` on invalid inputs
- [x] T042 [US2] Create `src/domain/entities/trip-offer-record.ts` — export `TripOfferRecord` type, `TripOfferPillState` type, `TripOfferPillColor` enum, `evaluateTripOfferPill(input): TripOfferPillState`, `createTripFromOffer(offer, actualEarnings): Trip`, and `resolveRatingColor` helper

### TripOfferRecord infrastructure

- [x] T043 [P] [US2] Create `src/domain/validations/trip-offer-record.ts` — `CreateTripOfferRecordSchema` (all distances/durations ≥ 0, `passengerRating` 0–5)
- [x] T044 [P] [US2] Create `src/domain/repositories/trip-offer-record.interface.repository.ts` with `ITripOfferRecordRepository` (create, findById, findAll, findByDateRange, delete)
- [x] T045 [P] [US2] Create `src/infra/db/schema/trip-offer-records.drizzle-schema.ts` with `tripOfferRecords` table (FKs → `trip_platforms`, `vehicles`)
- [x] T046 [US2] Create `src/infra/repositories/trip-offer-record.drizzle-repository.ts` implementing `ITripOfferRecordRepository`

### Application service + use cases

- [x] T047 [US2] Create `src/application/services/trip-offer-eval.service.ts` — resolves active `SavedProfitGoal`, latest `FuelPriceRecord`, vehicle `averageConsumption`, `UserSettings.tripOfferPill` thresholds, then calls `evaluateTripOfferPill`
- [x] T048 [P] [US2] Create `src/application/use-cases/trip-offer-record/record-trip-offer.ts` use case
- [x] T049 [P] [US2] Create `src/application/use-cases/trip-offer-record/evaluate-trip-offer.ts` use case (loads record + orchestrates `TripOfferEvalService`)
- [x] T050 [P] [US2] Create `src/application/use-cases/trip-offer-record/create-trip-from-offer.ts` use case (calls domain `createTripFromOffer`, then `tripRepo.create()`)

### Migration + tests

- [x] T051 [US2] Add export for `trip-offer-records` to `src/infra/db/schema/index.ts` and run `npx drizzle-kit generate`
- [x] T052 [US2] Create `tests/fakes/fake-trip-offer-record.repository.ts` in-memory fake
- [x] T053 [US2] Create `tests/domain-functions.test.ts` — test `evaluateTripOfferPill` for all 5 color states (blue/green/orange/red/neutral), `resolveRatingColor` for all 4 cases, `calculateProfit` for percentage and amount targets, `calculateFuelLiters` for valid and invalid inputs
- [x] T054 [US2] Create `tests/trip-offer-record.test.ts` — test `RecordTripOffer`, `EvaluateTripOffer` (integration with fake repos), `CreateTripFromOffer` (asserts Trip fields match offer)

**Checkpoint**: `npx jest tests/domain-functions.test.ts tests/trip-offer-record.test.ts` passes with full branch coverage on `evaluateTripOfferPill`.

---

## Phase 5: User Story 3 — Log Fuel with Type and Price History (Priority: P1) 🎯 MVP

**Goal**: Driver records refuel event with fuel type selection; consumption calculated; last price per type retrievable for offer evaluator.

**Independent Test**: Create FuelPriceRecord, call `GetLatestFuelPrice`, assert returned. Create FuelConsumptionRecord with known mileages and fuel added, assert `averageConsumption = distance / fuelAdded`.

### FuelPriceRecord

- [x] T055 [P] [US3] Create `src/domain/entities/fuel-price-record.ts` with `FuelPriceRecord` type and `FuelGaugeMeasurement` type
- [x] T056 [P] [US3] Create `src/domain/validations/fuel-price-record.ts` — `pricePerLiter > 0`
- [x] T057 [P] [US3] Create `src/domain/repositories/fuel-price-record.interface.repository.ts` with `IFuelPriceRecordRepository` (create, findLatestByFuelType, findAll, delete)
- [x] T058 [P] [US3] Create `src/infra/db/schema/fuel-price-records.drizzle-schema.ts` with `fuelPriceRecords` table (FK → `fuel_types`)
- [x] T059 [US3] Create `src/infra/repositories/fuel-price-record.drizzle-repository.ts` implementing `IFuelPriceRecordRepository`

### FuelConsumptionRecord

- [x] T060 [P] [US3] Create `src/domain/entities/fuel-consumption-record.ts` — export `FuelConsumptionRecord` type and `calculateAverageConsumption(input): number` throwing `ValidationError` when distance ≤ 0 or fuelAdded ≤ 0; apply gauge adjustment when both `fuelGaugeMeasurement` and `fuelGaugeTotalCapacity` are provided
- [x] T061 [P] [US3] Create `src/domain/validations/fuel-consumption-record.ts` — `endMileage > startMileage`, `fuelAdded > 0`
- [x] T062 [P] [US3] Create `src/domain/repositories/fuel-consumption-record.interface.repository.ts` with `IFuelConsumptionRecordRepository` (create, findById, findByVehicle, findAll, delete)
- [x] T063 [P] [US3] Create `src/infra/db/schema/fuel-consumption-records.drizzle-schema.ts` with `fuelConsumptionRecords` table (FKs → `vehicles`, `fuel_types`; flat gauge columns per R-004)
- [x] T064 [US3] Create `src/infra/repositories/fuel-consumption-record.drizzle-repository.ts` implementing `IFuelConsumptionRecordRepository`

### Use cases

- [x] T065 [P] [US3] Create `src/application/use-cases/fuel-price-record/record-fuel-price.ts` use case
- [x] T066 [P] [US3] Create `src/application/use-cases/fuel-price-record/get-latest-fuel-price.ts` use case returning `FuelPriceRecord | null`
- [x] T067 [US3] Create `src/application/use-cases/fuel-consumption-record/record-fuel-consumption.ts` use case — calls `calculateAverageConsumption` and stores result before persisting

### Migration + tests

- [x] T068 [US3] Add exports for `fuel-price-records`, `fuel-consumption-records` to `src/infra/db/schema/index.ts` and run `npx drizzle-kit generate`
- [x] T069 [US3] Create `tests/fakes/fake-fuel-price-record.repository.ts` and `tests/fakes/fake-fuel-consumption-record.repository.ts`
- [x] T070 [US3] Create `tests/fuel-consumption.test.ts` — test `calculateAverageConsumption` without gauge, with gauge adjustment, `ValidationError` on distance ≤ 0, `ValidationError` on fuelAdded ≤ 0
- [x] T071 [US3] Create `tests/fuel-price-record.test.ts` — test `RecordFuelPrice`, `GetLatestFuelPrice` (returns most recent by date; returns null when none), `RecordFuelConsumption` (asserts `averageConsumption` stored correctly)

**Checkpoint**: `npx jest tests/fuel-consumption.test.ts tests/fuel-price-record.test.ts` passes.

---

## Phase 6: User Story 4 — Create Recurring Costs (Priority: P2)

**Goal**: Cost entity supports RFC 5545 recurrence rules; date-range query expands recurring occurrences via rrule.js in app layer.

**Independent Test**: Create a Cost with monthly RRULE, call `GetCostsByDateRange` for 3 consecutive months, assert cost appears in each month. Assert exception date excluded.

### Cost entity update

- [x] T072 [US4] Update `src/domain/entities/cost.ts` — add `description?: string`, `recurrence?: Recurrence`, `tags?: string[]`; add `COST_CATEGORIES` const and `KnownCostCategory` type; update `create()` and `reconstitute()` to handle new fields
- [x] T073 [P] [US4] Update `src/domain/validations/cost.ts` — extend `CreateCostSchema` and `UpdateCostSchema` with `description`, `recurrence` (object: `rule` min-1 string, optional `endDate`, optional `exceptions` array), `tags`
- [x] T074 [P] [US4] Update `src/infra/db/schema/costs.drizzle-schema.ts` — add `description`, `recurrence_rule`, `recurrence_end_date`, `recurrence_exceptions` (JSON text), `tags` (JSON text) columns
- [x] T075 [US4] Update `src/domain/repositories/cost.interface.repository.ts` — add `findByDateRange(from: Date, to: Date): Promise<Cost[]>`
- [x] T076 [US4] Update `src/infra/repositories/cost.drizzle-repository.ts` — implement `findByDateRange()` returning all stored Cost rows whose date falls within range

### RecurrenceService + use case

- [x] T077 [US4] Create `src/application/services/recurrence.service.ts` — wraps `rrule.js`; exports `getOccurrences(recurrence: Recurrence, after?: Date, before?: Date): Date[]` using `RRuleSet` + `rrulestr`; handles `exceptions` via `exdate`
- [x] T078 [US4] Create `src/application/use-cases/cost/get-costs-by-date-range.ts` — calls `costRepo.findByDateRange()`, then for each recurring Cost expands occurrences via `recurrenceService.getOccurrences()` and merges with one-time costs; returns unified list

### Migration + tests

- [x] T079 [US4] Run `npx drizzle-kit generate` for `costs` table column additions
- [x] T080 [US4] Update `tests/fakes/fake-cost.repository.ts` — add `findByDateRange()` method
- [x] T081 [US4] Update `tests/cost.test.ts` — add cases: create Cost with recurrence; update Cost adding recurrence; `GetCostsByDateRange` returns one-time + recurring occurrences; exception date excluded; endDate respected

**Checkpoint**: `npx jest tests/cost.test.ts` passes including recurrence cases.

---

## Phase 7: User Story 5 — Schedule and Track Vehicle Maintenance (Priority: P2)

**Goal**: Driver schedules maintenance by date or mileage; completed vs. pending status tracked; actual cost recorded on completion.

**Independent Test**: Create Maintenance with mileage trigger, call `GetPendingMaintenances`, assert present. Call `UpdateMaintenance` with `completedAt` + `actualCost`, assert no longer in pending list.

- [x] T082 [P] [US5] Create `src/domain/entities/maintenance.ts` — export `MaintenanceTrigger` discriminated union and `Maintenance` type
- [x] T083 [P] [US5] Create `src/domain/validations/maintenance.ts` — `CreateMaintenanceSchema`: `estimatedCost > 0`; `date` trigger requires `date` field; `mileage` trigger requires `mileage > 0`; `UpdateMaintenanceSchema`
- [x] T084 [P] [US5] Create `src/domain/repositories/maintenance.interface.repository.ts` with `IMaintenanceRepository` (create, findById, findByVehicle, findPending, update, delete)
- [x] T085 [P] [US5] Create `src/infra/db/schema/maintenances.drizzle-schema.ts` — flat `trigger_type`, `trigger_date`, `trigger_mileage` columns; FK → `vehicles`
- [x] T086 [US5] Create `src/infra/repositories/maintenance.drizzle-repository.ts` implementing `IMaintenanceRepository` — `findPending()` filters `completed_at IS NULL`; `reconstitute()` rebuilds `MaintenanceTrigger` union from flat columns
- [x] T087 [P] [US5] Create use cases in `src/application/use-cases/maintenance/`: `create-maintenance.ts`, `update-maintenance.ts`, `delete-maintenance.ts`, `get-pending-maintenances.ts`
- [x] T088 [US5] Add export for `maintenances` to `src/infra/db/schema/index.ts` and run `npx drizzle-kit generate`
- [x] T089 [US5] Create `tests/fakes/fake-maintenance.repository.ts` in-memory fake
- [x] T090 [US5] Create `tests/maintenance.test.ts` — test `CreateMaintenance` with date trigger; `CreateMaintenance` with mileage trigger; `ValidationError` on missing required fields; `UpdateMaintenance` sets `completedAt`; `GetPendingMaintenances` excludes completed records

**Checkpoint**: `npx jest tests/maintenance.test.ts` passes.

---

## Phase 8: User Story 6 — Plan Days Off and Vacations (Priority: P2)

**Goal**: Driver marks days off and vacation periods; worked days within vacation period tracked as partial exceptions; cancelled absences queryable.

**Independent Test**: Create vacation absence, query by date range, assert present. Add day to `workedDays`, assert it is included. Set `cancelledAt`, assert visible but marked cancelled.

- [x] T091 [P] [US6] Create `src/domain/entities/planned-absence.ts` with `PlannedAbsence` type
- [x] T092 [P] [US6] Create `src/domain/validations/planned-absence.ts` — `vacation` type requires `endDate >= date`; `day_off` type forbids `endDate`; `UpdatePlannedAbsenceSchema` includes `workedDays` array and `cancelledAt`
- [x] T093 [P] [US6] Create `src/domain/repositories/planned-absence.interface.repository.ts` with `IPlannedAbsenceRepository` (create, findById, findByDateRange, update, delete)
- [x] T094 [P] [US6] Create `src/infra/db/schema/planned-absences.drizzle-schema.ts` — `worked_days` as JSON text column; `cancelled_at` timestamp nullable
- [x] T095 [US6] Create `src/infra/repositories/planned-absence.drizzle-repository.ts` implementing `IPlannedAbsenceRepository` — deserializes `workedDays` JSON on read
- [x] T096 [P] [US6] Create use cases in `src/application/use-cases/planned-absence/`: `create-planned-absence.ts`, `update-planned-absence.ts`, `delete-planned-absence.ts`
- [x] T097 [US6] Add export for `planned-absences` to `src/infra/db/schema/index.ts` and run `npx drizzle-kit generate`
- [x] T098 [US6] Create `tests/fakes/fake-planned-absence.repository.ts` in-memory fake
- [x] T099 [US6] Create `tests/planned-absence.test.ts` — test day_off creation; vacation creation; `ValidationError` when vacation missing `endDate`; `ValidationError` when day_off has `endDate`; `UpdatePlannedAbsence` adds workedDays; `UpdatePlannedAbsence` sets cancelledAt

**Checkpoint**: `npx jest tests/planned-absence.test.ts` passes.

---

## Phase 9: User Story 7 — View Official Holidays and Custom Events (Priority: P2)

**Goal**: Official Brazilian holidays auto-loaded from BrasilAPI on first launch; custom events creatable; sync failures are silent.

**Independent Test**: Create SpecialDay with `source: 'custom'`, query by year, assert returned. Verify `DeleteSpecialDay` throws `ConflictError` for official entry.

- [x] T100 [P] [US7] Create `src/domain/entities/special-day.ts` with `SpecialDay` type
- [x] T101 [P] [US7] Create `src/domain/validations/special-day.ts` — `CreateSpecialDaySchema`: only `source: 'custom'` allowed at creation; `description` min 1
- [x] T102 [P] [US7] Create `src/domain/repositories/special-day.interface.repository.ts` with `ISpecialDayRepository` (create, findByDateRange, findByYear, upsertOfficial, delete)
- [x] T103 [P] [US7] Create `src/infra/db/schema/special-days.drizzle-schema.ts` with `specialDays` table
- [x] T104 [US7] Create `src/infra/repositories/special-day.drizzle-repository.ts` implementing `ISpecialDayRepository` — `upsertOfficial()` uses INSERT OR REPLACE; `delete()` throws `ConflictError` when `source = 'official'`
- [x] T105 [US7] Create `src/application/services/holiday-sync.service.ts` — fetches `https://brasilapi.com.br/api/feriados/v1/{year}`, maps `{ date, name, type }` to `SpecialDay[]`, calls `specialDayRepo.upsertOfficial()`; catches network errors silently; returns `{ synced, skipped }`
- [x] T106 [P] [US7] Create use cases in `src/application/use-cases/special-day/`: `sync-official-holidays.ts` (calls `HolidaySyncService`), `create-special-day.ts` (forces `source: 'custom'`), `delete-special-day.ts`
- [x] T107 [US7] Add export for `special-days` to `src/infra/db/schema/index.ts` and run `npx drizzle-kit generate`
- [x] T108 [US7] Create `tests/fakes/fake-special-day.repository.ts` in-memory fake — `upsertOfficial` deduplicates by date + source
- [x] T109 [US7] Create `tests/special-day.test.ts` — test `CreateSpecialDay` (custom); `ValidationError` when `source='official'` passed to create use case; `DeleteSpecialDay` throws `ConflictError` for official entries; `SyncOfficialHolidays` with mock HTTP asserts rows inserted; `SyncOfficialHolidays` on network failure asserts no error thrown

**Checkpoint**: `npx jest tests/special-day.test.ts` passes.

---

## Phase 10: User Story 8 — Set Reminders with Optional Recurrence (Priority: P3)

**Goal**: Driver creates reminders with optional recurrence and alarm; notification scheduled when `alarm` is true.

**Independent Test**: Create Reminder with `alarm=true`, assert notification scheduled via mock. Create with yearly recurrence, assert entity persisted and retrievable.

- [x] T110 [P] [US8] Create `src/domain/entities/reminder.ts` with `Reminder` type (reuses `Recurrence` from T003)
- [x] T111 [P] [US8] Create `src/domain/validations/reminder.ts` — `CreateReminderSchema`: `message` min 1; `alarm` boolean; recurrence fields optional; `UpdateReminderSchema`
- [x] T112 [P] [US8] Create `src/domain/repositories/reminder.interface.repository.ts` with `IReminderRepository` (create, findById, findAll, update, delete)
- [x] T113 [P] [US8] Create `src/infra/db/schema/reminders.drizzle-schema.ts` — flat `recurrence_rule`, `recurrence_end_date`, `recurrence_exceptions` columns; `alarm` as integer boolean
- [x] T114 [US8] Create `src/infra/repositories/reminder.drizzle-repository.ts` implementing `IReminderRepository`
- [x] T115 [US8] Create `src/application/use-cases/reminder/create-reminder.ts` — after persisting, if `alarm = true` calls `expo-notifications` `scheduleNotificationAsync` with reminder's date and message
- [x] T116 [P] [US8] Create `src/application/use-cases/reminder/update-reminder.ts` and `src/application/use-cases/reminder/delete-reminder.ts`
- [x] T117 [US8] Add export for `reminders` to `src/infra/db/schema/index.ts` and run `npx drizzle-kit generate`
- [x] T118 [US8] Create `tests/fakes/fake-reminder.repository.ts` in-memory fake
- [x] T119 [US8] Create `tests/reminder.test.ts` — test `CreateReminder` persists correctly; `alarm=true` triggers notification mock; `alarm=false` skips notification; `UpdateReminder`; `DeleteReminder`; recurrence field stored and retrieved

**Checkpoint**: `npx jest tests/reminder.test.ts` passes.

---

## Phase 11: User Story 9 — Configure App Preferences (Priority: P3)

**Goal**: Driver persists preferred units, currency, and pill thresholds; defaults returned when no settings saved.

**Independent Test**: Call `GetUserSettings` with empty DB, assert `DEFAULT_USER_SETTINGS` returned. Call `UpdateUserSettings` with custom units, assert persisted. Call `GetUserSettings` again, assert custom values.

- [x] T120 [P] [US9] Create `src/domain/entities/user-settings.ts` — export `UserSettings` type and `DEFAULT_USER_SETTINGS` constant
- [x] T121 [P] [US9] Create `src/domain/validations/user-settings.ts` — `UpdateUserSettingsSchema`: `preferredUnits` enum, `currency` min 3 chars, partial `displayPreferences`, optional `starredTool` enum, optional `tripOfferPill` object with threshold numbers
- [x] T122 [P] [US9] Create `src/domain/repositories/user-settings.interface.repository.ts` with `IUserSettingsRepository` (get, upsert)
- [x] T123 [P] [US9] Create `src/infra/db/schema/user-settings.drizzle-schema.ts` — `display_preferences` and `trip_offer_pill` as JSON text columns; `id` always `'default'`
- [x] T124 [US9] Create `src/infra/repositories/user-settings.drizzle-repository.ts` implementing `IUserSettingsRepository` — `get()` returns `DEFAULT_USER_SETTINGS` if row absent; `upsert()` uses INSERT OR REPLACE by `id = 'default'`
- [x] T125 [P] [US9] Create `src/application/use-cases/user-settings/get-user-settings.ts` and `src/application/use-cases/user-settings/update-user-settings.ts`
- [x] T126 [US9] Add export for `user-settings` to `src/infra/db/schema/index.ts` and run `npx drizzle-kit generate`
- [x] T127 [US9] Create `tests/fakes/fake-user-settings.repository.ts` in-memory fake
- [x] T128 [US9] Create `tests/user-settings.test.ts` — test `GetUserSettings` returns default when empty; `UpdateUserSettings` persists custom values; `GetUserSettings` after update returns custom values; `ValidationError` on invalid `preferredUnits`

**Checkpoint**: `npx jest tests/user-settings.test.ts` passes.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Profit entity, WorkSession update method, Goals, Trip.platform migration, export update, full test suite validation.

### Profit entity

- [x] T129 [P] Create `src/domain/entities/profit.ts` with `Profit` type
- [x] T130 [P] Create `src/domain/validations/profit.ts` — `amount > 0`, `platformId` min 1
- [x] T131 [P] Create `src/domain/repositories/profit.interface.repository.ts` with `IProfitRepository` (create, findById, findAll, findByDateRange, update, delete)
- [x] T132 [P] Create `src/infra/db/schema/profits.drizzle-schema.ts` with `profits` table (FK → `trip_platforms`)
- [x] T133 Create `src/infra/repositories/profit.drizzle-repository.ts` implementing `IProfitRepository`
- [x] T134 [P] Create use cases in `src/application/use-cases/profit/`: `create-profit.ts`, `update-profit.ts`, `delete-profit.ts`

### WorkSession update

- [x] T135 Update `src/domain/repositories/work-session.interface.repository.ts` — add `update(session: WorkSession): Promise<WorkSession>`
- [x] T136 Update `src/infra/repositories/work-session.drizzle-repository.ts` — implement `update()` method
- [x] T137 [P] Create `src/application/use-cases/work-session/update-work-session.ts` — validates `startTime < endTime` when both provided; throws `ValidationError` otherwise

### SavedProfitGoal + PlatformProfitGoal

- [x] T138 [P] Create `src/domain/entities/saved-profit-goal.ts` and `src/domain/entities/platform-profit-goal.ts`
- [x] T139 [P] Create `src/domain/validations/saved-profit-goal.ts` and `src/domain/validations/platform-profit-goal.ts`
- [x] T140 [P] Create `src/domain/repositories/saved-profit-goal.interface.repository.ts` and `src/domain/repositories/platform-profit-goal.interface.repository.ts`
- [x] T141 [P] Create `src/infra/db/schema/saved-profit-goals.drizzle-schema.ts` and `src/infra/db/schema/platform-profit-goals.drizzle-schema.ts`
- [x] T142 Create `src/infra/repositories/saved-profit-goal.drizzle-repository.ts` and `src/infra/repositories/platform-profit-goal.drizzle-repository.ts`
- [x] T143 [P] Create use cases in `src/application/use-cases/saved-profit-goal/` (create, update, delete) and `src/application/use-cases/platform-profit-goal/` (create, update, delete)

### Trip.platform → platformId migration (R-003)

- [x] T144 Update `src/domain/entities/trip.ts` — replace `platform: string` field with `platformId: string`
- [x] T145 Update `src/domain/validations/trip.ts` — replace `platform` with `platformId` in `CreateTripSchema` and `UpdateTripSchema`
- [x] T146 Update `src/infra/db/schema/trips.drizzle-schema.ts` — replace `platform TEXT NOT NULL` column with `platform_id TEXT REFERENCES trip_platforms(id)` (add column before dropping; keep both during migration window)
- [x] T147 Write Drizzle migration SQL in `src/infra/db/migrations/` for `trips` platform back-fill — single transaction: read distinct `platform` values → INSERT `TripPlatform` rows (deduplicated by name) → back-fill `platform_id` via UPDATE → DROP COLUMN `platform` (see research.md R-003)
- [x] T148 Update `src/infra/repositories/trip.drizzle-repository.ts` — use `platform_id` in all queries; update `reconstitute()` to map `platform_id` → `platformId`

### Schema index + final migration

- [x] T149 Add exports for `profits`, `saved-profit-goals`, `platform-profit-goals` to `src/infra/db/schema/index.ts` and run `npx drizzle-kit generate` for all remaining new tables

### Export update

- [x] T150 Update `src/application/use-cases/export-data-as-json.use-case.ts` — include `profits`, `tripOfferRecords`, `savedProfitGoals`, `platformProfitGoals`, `reminders`, `maintenances`, `specialDays`, `plannedAbsences` in the JSON export envelope

### Tests — Polish

- [x] T151 [P] Create `tests/profit.test.ts` — test `CreateProfit`, `UpdateProfit`, `DeleteProfit`, `ValidationError` on `amount ≤ 0`
- [x] T152 [P] Update `tests/work-session.test.ts` — add `UpdateWorkSession` test cases: corrects startTime/endTime, `ValidationError` when `startTime ≥ endTime`
- [x] T153 [P] Create `tests/saved-profit-goal.test.ts` and `tests/platform-profit-goal.test.ts` — CRUD + validation
- [x] T154 Update `tests/trip.test.ts` — replace all `platform` references with `platformId`; add test asserting `platform` field no longer exists on entity

### Domain purity + full suite validation

- [x] T155 Run `npx eslint src/domain/` and assert zero errors (validates domain purity rule from T002)
- [x] T156 Run full test suite `npx jest tests/` and assert all tests pass including pre-existing `dashboard.test.ts`, `export.test.ts`, `hooks.test.ts`, `vehicle.test.ts`, `trip.test.ts`, `cost.test.ts`, `fuel-log.test.ts`, `goal.test.ts`, `work-session.test.ts`
- [x] T157 Run `npx tsc --noEmit` and assert zero TypeScript errors

**Checkpoint**: All 157 tasks complete. Full test suite green. Zero TypeScript errors. Zero ESLint domain purity violations.

---

## Dependency Graph (Story Completion Order)

```
Phase 1 (Setup)
  └── Phase 2 (Foundational: FuelType + VehicleType + TripPlatform)
        ├── Phase 3 (US1: Vehicle + MileageRecord)
        ├── Phase 4 (US2: Trip Offer Evaluation) — depends on US1 for vehicle consumption
        ├── Phase 5 (US3: Fuel Logging)           — independent
        ├── Phase 6 (US4: Recurring Costs)        — independent
        ├── Phase 7 (US5: Maintenance)            — depends on US1 for vehicleId
        ├── Phase 8 (US6: Planned Absences)       — independent
        ├── Phase 9 (US7: Special Days)           — independent
        ├── Phase 10 (US8: Reminders)             — independent
        └── Phase 11 (US9: UserSettings)          — independent
              └── Final Phase (Profit, WorkSession, Goals, Trip migration, Export)
```

US3–US9 can be implemented **in parallel** after Phase 2 is complete.
US2 (`EvaluateTripOffer`) depends on US1 (vehicle averageConsumption) and US3 (FuelPriceRecord) at the service level — but the pure function `evaluateTripOfferPill` can be written and unit-tested independently.

---

## Parallel Execution Examples

**After Phase 2 completes**, the following story phases can run simultaneously:

- Developer A: Phase 3 (US1 Vehicle) + Phase 7 (US5 Maintenance)
- Developer B: Phase 4 (US2 Trip Offer) + Phase 5 (US3 Fuel)
- Developer C: Phase 6 (US4 Costs) + Phase 8 (US6 Planned Absences)
- Developer D: Phase 9 (US7 Holidays) + Phase 10 (US8 Reminders) + Phase 11 (US9 Settings)

---

## Implementation Strategy

**MVP scope** (P1 stories only — deliver first):

Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) — ~71 tasks

This delivers: extended vehicle registration, real-time trip offer evaluation with profit pill, and fuel type tracking with price history — the three highest-value features for the driver.

**P2 stories** (second increment): Phases 6–9 in parallel
**P3 stories** (third increment): Phases 10–11
**Polish** last: Trip migration, Profit entity, goals, export update, full suite

---

## Task Count Summary

| Phase                                | Tasks   | Stories Covered                       |
| ------------------------------------ | ------- | ------------------------------------- |
| Phase 1: Setup                       | 2       | —                                     |
| Phase 2: Foundational                | 21      | FuelType, VehicleType, TripPlatform   |
| Phase 3: US1 Vehicle + MileageRecord | 17      | US1                                   |
| Phase 4: US2 Trip Offer Evaluation   | 14      | US2                                   |
| Phase 5: US3 Fuel Logging            | 17      | US3                                   |
| Phase 6: US4 Recurring Costs         | 10      | US4                                   |
| Phase 7: US5 Maintenance             | 9       | US5                                   |
| Phase 8: US6 Planned Absences        | 9       | US6                                   |
| Phase 9: US7 Special Days            | 10      | US7                                   |
| Phase 10: US8 Reminders              | 10      | US8                                   |
| Phase 11: US9 UserSettings           | 9       | US9                                   |
| Final: Polish                        | 29      | Profit, WorkSession, Goals, Migration |
| **Total**                            | **157** | **US1–US9**                           |

**Parallel opportunities**: ~70 tasks marked `[P]`
**MVP tasks** (P1 stories only): T001–T071 (~71 tasks)
