---
description: "Task list for 001-app-backend — Clean Architecture Domain & Data Layer"
---

# Tasks: App Backend — Clean Architecture Domain & Data Layer

**Input**: `specs/001-app-backend/plan.md`, `spec.md`, `data-model.md`, `research.md`
**Branch**: `feat/001-app-backend`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (independent files, no incomplete dependencies)
- **[Story]**: Which user story this task belongs to (US1–US8)
- US8 (quick-entry overlay) backend requirements are fully addressed inside US1 and US2 tasks — `CreateTrip` and `CreateCost` already support optional fields and date defaulting per FR-016. No separate US8 phase needed for the data layer.

## Path Conventions

All paths relative to repo root. Structure from `plan.md`:

```
src/
├── app/                        # OUT OF SCOPE (future specs)
├── application/use-cases/      # Use case implementations
├── domain/
│   ├── entities/               # TypeScript entity types
│   ├── repositories/           # Repository interfaces
│   └── validations/            # Zod schemas
├── infra/
│   ├── db/
│   │   ├── client.ts           # SQLite singleton + migrate()
│   │   ├── schema/             # Drizzle table definitions
│   │   └── migrations/         # drizzle-kit output (committed)
│   └── repositories/           # Drizzle repository implementations
├── lib/
│   ├── errors/                 # Typed error classes
│   └── constants/              # FuelType constants, etc.
└── types/                      # Shared output types (DashboardSummary, etc.)
tests/
└── fakes/                      # In-memory repository stubs for use case tests
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Expo project, install all dependencies, and configure tooling. Must be complete before any domain code is written.

- [ ] T001 Create Expo project with blank-typescript template: `npx create-expo-app@latest petasos --template blank-typescript`
- [ ] T002 Install runtime dependencies: `npx expo install expo-sqlite && npm install drizzle-orm nanoid zod`
- [ ] T003 [P] Install dev dependencies: `npm install -D drizzle-kit jest @types/jest ts-jest @testing-library/react-native`
- [ ] T004 [P] Configure `tsconfig.json` with strict mode and `@/*` path alias mapping to repo root
- [ ] T005 [P] Configure `drizzle.config.ts` with `dialect: 'sqlite'`, `driver: 'expo'`, schema glob `src/infra/db/schema/*`, output `src/infra/db/migrations`
- [ ] T006 [P] Configure `jest.config.ts` with `ts-jest` preset and `testEnvironment: 'node'`, matching `tests/**/*.test.ts` and `src/**/__tests__/**/*.test.ts`

**Checkpoint**: `npx tsc --noEmit` passes; `npx jest --listTests` runs without error.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that MUST be complete before any user story work begins — error taxonomy, DB client, and shared types are dependencies of every use case and repository.

⚠️ **CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 Create base error class `AppError` in `src/lib/errors/AppError.ts` with `code: string` and `message: string` fields
- [ ] T008 [P] Create `ValidationError` in `src/lib/errors/ValidationError.ts` (extends AppError, code: `'VALIDATION_ERROR'`)
- [ ] T009 [P] Create `StorageError` in `src/lib/errors/StorageError.ts` (extends AppError, code: `'STORAGE_ERROR'`, wraps underlying error)
- [ ] T010 [P] Create `NotFoundError` in `src/lib/errors/NotFoundError.ts` (extends AppError, code: `'NOT_FOUND'`, includes entity name + id)
- [ ] T011 [P] Create `ConflictError` in `src/lib/errors/ConflictError.ts` (extends AppError, code: `'CONFLICT'`)
- [ ] T012 [P] Create shared type exports in `src/lib/errors/index.ts` re-exporting all four error classes
- [ ] T013 [P] Create `DateRangeFilter` and `TripFilter`, `CostFilter` shared types in `src/types/shared.ts`
- [ ] T014 [P] Create `FUEL_TYPES` constant array and `KnownFuelType` type in `src/lib/constants/fuelTypes.ts`
- [ ] T015 Create SQLite singleton and Drizzle client in `src/infra/db/client.ts` using `expo-sqlite` `openDatabaseSync` + `drizzle()` from `drizzle-orm/expo-sqlite`; export `db` and async `initializeDatabase()` that calls `migrate(db, migrations)`

**Checkpoint**: Foundation ready — all error types exported, DB client compiles, shared types available. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 + US8 — Trip Recording & Quick-Entry (Priority: P1) 🎯 MVP

**Goal**: Drivers can create, update, and query trips. `CreateTrip` accepts quick-entry inputs (only `earnings` + `platform` required; all other fields nullable). Records are persisted offline and retrievable by filter. US8 backend contract fully satisfied by this phase.

**Independent Test**: Create a trip with only `{ earnings: 18.50, platform: 'Uber' }` → assert it is persisted with `null` distance/duration/origin/destination → assert `GetTripsByFilter` returns it → assert `UpdateTrip` modifies earnings correctly.

### Implementation for User Story 1 + US8

- [ ] T016 [P] [US1] Define `CreateTripInput`, `UpdateTripInput`, `TripFilter` Zod schemas in `src/domain/validations/trip.ts` (earnings ≥ 0, platform non-empty; origin/destination/distance/duration/vehicleId optional/nullable)
- [ ] T017 [P] [US1] Create `Trip` entity type in `src/domain/entities/Trip.ts` (id, date, earnings, platform, distance|null, duration|null, origin|null, destination|null, vehicleId|null)
- [ ] T018 [US1] Create `ITripRepository` interface in `src/domain/repositories/ITripRepository.ts` with `create`, `findById`, `findAll`, `findByFilter`, `update`, `delete` methods (depends on T017, T013)
- [ ] T019 [US1] Create `trips` Drizzle schema in `src/infra/db/schema/trips.ts` with all columns per `data-model.md` (depends on T015)
- [ ] T020 [US1] Implement `DrizzleTripRepository` in `src/infra/repositories/DrizzleTripRepository.ts` implementing `ITripRepository`; wrap SQLite errors in `StorageError`; throw `NotFoundError` on missing records (depends on T018, T019)
- [ ] T021 [US1] Implement `CreateTrip` use case in `src/application/use-cases/CreateTrip.ts`: validate with Zod, default `date` to `new Date()`, generate `id` with `nanoid`, delegate to `ITripRepository.create` (depends on T018, T016)
- [ ] T022 [US1] Implement `UpdateTrip` use case in `src/application/use-cases/UpdateTrip.ts`: validate partial input, throw `ValidationError` if earnings < 0, delegate to `ITripRepository.update` (depends on T018, T016)
- [ ] T023 [US1] Implement `GetTripsByFilter` use case in `src/application/use-cases/GetTripsByFilter.ts`: validate date range (from ≤ to), delegate to `ITripRepository.findByFilter` (depends on T018, T013)

**Checkpoint**: User Story 1 + US8 data layer fully functional. Quick-entry trip (`earnings` + `platform` only) persists with all nullable fields as `null`.

---

## Phase 4: User Story 2 — Cost Logging (Priority: P1)

**Goal**: Drivers can create, update, and query operational costs. `CreateCost` accepts quick-entry inputs (only `amount` + `category` required; `date` defaults to today). Standard and custom categories both supported.

**Independent Test**: Create a cost with only `{ amount: 50, category: 'fuel' }` → assert `date` defaults to today → assert `GetCostsByFilter` returns it in its date range → assert `UpdateCost` modifies amount correctly.

### Implementation for User Story 2

- [ ] T024 [P] [US2] Define `CreateCostInput`, `UpdateCostInput`, `CostFilter` Zod schemas in `src/domain/validations/cost.ts` (amount > 0, category non-empty string)
- [ ] T025 [P] [US2] Create `Cost` entity type and `CostCategory` union in `src/domain/entities/Cost.ts`
- [ ] T026 [US2] Create `ICostRepository` interface in `src/domain/repositories/ICostRepository.ts` with `create`, `findById`, `findAll`, `findByFilter`, `update`, `delete` methods (depends on T025, T013)
- [ ] T027 [US2] Create `costs` Drizzle schema in `src/infra/db/schema/costs.ts` (depends on T015)
- [ ] T028 [US2] Implement `DrizzleCostRepository` in `src/infra/repositories/DrizzleCostRepository.ts` implementing `ICostRepository`; wrap SQLite errors in `StorageError` (depends on T026, T027)
- [ ] T029 [US2] Implement `CreateCost` use case in `src/application/use-cases/CreateCost.ts`: validate, default `date` to `new Date()`, generate id with `nanoid` (depends on T026, T024)
- [ ] T030 [US2] Implement `UpdateCost` use case in `src/application/use-cases/UpdateCost.ts`: validate partial input, throw `ValidationError` if amount ≤ 0 (depends on T026, T024)
- [ ] T031 [US2] Implement `GetCostsByFilter` use case in `src/application/use-cases/GetCostsByFilter.ts`: validate date range (from ≤ to) (depends on T026, T013)

**Checkpoint**: User Stories 1 and 2 independently functional. A full profit calculation (earnings − costs) can be tested with seeded data.

---

## Phase 5: User Story 3 — Fuel Tracking (Priority: P2)

**Goal**: Drivers log fuel fill-ups with fuel type. System computes km/L and cost-per-km per fuel type using odometer-ordered consecutive logs. Cross-type calculations are forbidden.

**Independent Test**: Insert two Gasolina logs (odometer 1000 → 1100, liters 10) → assert `GetFuelEfficiency` returns `{ fuelType: 'Gasolina', kmPerLiter: 10, costPerKm: ... }`. Insert a single Etanol log → assert Etanol `kmPerLiter` is `null`. Insert a third log with lower odometer → assert `CreateFuelLog` throws `ValidationError`.

### Implementation for User Story 3

- [ ] T032 [P] [US3] Define `CreateFuelLogInput` Zod schema in `src/domain/validations/fuelLog.ts` (fuelType non-empty, liters > 0, totalPrice > 0, odometer ≥ 0)
- [ ] T033 [P] [US3] Create `FuelLog` entity type in `src/domain/entities/FuelLog.ts` (id, date, fuelType, liters, totalPrice, odometer)
- [ ] T034 [US3] Create `IFuelLogRepository` interface in `src/domain/repositories/IFuelLogRepository.ts` with standard methods plus `findByFuelTypeOrderedByOdometer(fuelType: string): Promise<FuelLog[]>` (depends on T033)
- [ ] T035 [US3] Create `fuel_logs` Drizzle schema in `src/infra/db/schema/fuelLogs.ts` (depends on T015)
- [ ] T036 [US3] Implement `DrizzleFuelLogRepository` in `src/infra/repositories/DrizzleFuelLogRepository.ts`; implement `findByFuelTypeOrderedByOdometer` with `WHERE fuel_type = ? ORDER BY odometer ASC` (depends on T034, T035)
- [ ] T037 [US3] Implement `CreateFuelLog` use case in `src/application/use-cases/CreateFuelLog.ts`: validate input, fetch previous log of same `fuelType` via `findByFuelTypeOrderedByOdometer`, throw `ValidationError` if new odometer ≤ previous odometer (depends on T034, T032)
- [ ] T038 [US3] Implement `GetFuelEfficiency` use case in `src/application/use-cases/GetFuelEfficiency.ts`: group logs by `fuelType`, compute pairwise km/L within each group using odometer order, return `FuelEfficiencyResult[]` with `null` km/L when fewer than 2 logs exist for a type (depends on T034)

**Checkpoint**: User Story 3 independently functional. Dual-fuel (Gasolina + Etanol) efficiency reported separately; odometer validation enforced per type.

---

## Phase 6: User Story 4 — Dashboard Summary (Priority: P2)

**Goal**: A single use case aggregates trips and costs for a date range, returning totalEarnings, totalCosts, netProfit, earningsByPlatform, and costPerKm (null if no trips have distance). Zero-value result returned when no data exists for the range.

**Independent Test**: Seed 3 trips (Uber: R$50, 99: R$30, Uber: R$20, distances: 10km, null, 5km) + 2 costs (R$15 + R$10) → assert `totalEarnings = 100`, `totalCosts = 25`, `netProfit = 75`, `earningsByPlatform = [{Uber, 70}, {99, 30}]`, `costPerKm = 1.67` (25 / 15km).

### Implementation for User Story 4

- [ ] T039 [US4] Define `DashboardSummary` and `PlatformEarnings` output types in `src/types/DashboardSummary.ts`
- [ ] T040 [US4] Implement `GetDashboardSummary` use case in `src/application/use-cases/GetDashboardSummary.ts`: accept `DateRangeFilter`, fetch trips and costs via their repositories, compute all fields; exclude null-distance trips from costPerKm denominator (depends on T018, T026, T039, T013)

**Checkpoint**: Dashboard summary verified correct against manual calculations on seeded data — no rounding above 2 decimal places (SC-005).

---

## Phase 7: User Story 6 — Work Sessions (Priority: P3)

**Goal**: Drivers clock in and out. Only one active session (endTime IS NULL) allowed at a time — `StartWorkSession` throws `ConflictError` if one exists; `EndWorkSession` throws `ConflictError` if none exists.

**Independent Test**: Start session → assert no endTime → start again → assert `ConflictError` → end session → assert endTime set → end again → assert `ConflictError`.

### Implementation for User Story 6

- [ ] T041 [P] [US6] Create `WorkSession` entity type in `src/domain/entities/WorkSession.ts` (id, startTime, endTime: Date | null)
- [ ] T042 [US6] Create `IWorkSessionRepository` interface in `src/domain/repositories/IWorkSessionRepository.ts` with standard methods plus `findActive(): Promise<WorkSession | null>` (depends on T041)
- [ ] T043 [US6] Create `work_sessions` Drizzle schema in `src/infra/db/schema/workSessions.ts` (depends on T015)
- [ ] T044 [US6] Implement `DrizzleWorkSessionRepository` in `src/infra/repositories/DrizzleWorkSessionRepository.ts`; implement `findActive` with `WHERE end_time IS NULL LIMIT 1` (depends on T042, T043)
- [ ] T045 [US6] Implement `StartWorkSession` use case in `src/application/use-cases/StartWorkSession.ts`: call `findActive()`, throw `ConflictError` if session exists, else create new session with `endTime: null` (depends on T042)
- [ ] T046 [US6] Implement `EndWorkSession` use case in `src/application/use-cases/EndWorkSession.ts`: call `findActive()`, throw `ConflictError` if null, else update `endTime` to `new Date()` (depends on T042)

**Checkpoint**: Work session state machine verified. No data corruption when session is left open — next `StartWorkSession` call cleanly returns `ConflictError` (SC-006).

---

## Phase 8: User Story 7 — Goals (Priority: P3)

**Goal**: Drivers set earnings goals (daily/weekly/monthly). `GetGoalProgress` measures gross earnings (not net profit) in the derived period and returns a percentage capped at 100.

**Independent Test**: Create daily goal `targetAmount: 100, periodStart: today` → seed 3 trips totalling R$80 → assert `progressPct = 80` → seed 1 more trip of R$30 → assert `progressPct = 100` (capped).

### Implementation for User Story 7

- [ ] T047 [P] [US7] Define `CreateGoalInput`, `UpdateGoalInput` Zod schemas in `src/domain/validations/goal.ts` (targetAmount > 0, type in enum, periodStart required)
- [ ] T048 [P] [US7] Create `Goal` entity type and `GoalType` union in `src/domain/entities/Goal.ts`
- [ ] T049 [US7] Create `IGoalRepository` interface in `src/domain/repositories/IGoalRepository.ts` (depends on T048)
- [ ] T050 [US7] Create `goals` Drizzle schema in `src/infra/db/schema/goals.ts` (depends on T015)
- [ ] T051 [US7] Implement `DrizzleGoalRepository` in `src/infra/repositories/DrizzleGoalRepository.ts` (depends on T049, T050)
- [ ] T052 [US7] Implement `SetGoal` use case in `src/application/use-cases/SetGoal.ts`: validate, generate id, persist via `IGoalRepository.create` (depends on T049, T047)
- [ ] T053 [US7] Implement `GetGoalProgress` use case in `src/application/use-cases/GetGoalProgress.ts`: derive `periodEnd` from `type` + `periodStart` (daily = same day, weekly = +7d, monthly = last day of month), fetch trips in range via `ITripRepository`, sum earnings, compute `Math.min((totalEarnings / targetAmount) * 100, 100)` (depends on T049, T018)

**Checkpoint**: All three goal types (daily, weekly, monthly) return correct progress percentages including the 100% cap.

---

## Phase 9: User Story 5 — JSON Export (Priority: P3)

**Goal**: A single use case returns a fully typed `ExportEnvelope` with all entities, optionally filtered by date range and/or platform. The use case has zero file-system dependency — serialisation to file is the UI layer's responsibility (per Constitution Principle IV).

**Independent Test**: Seed all entity types → call `ExportDataAsJSON({})` → assert all records present → call with `{ platform: 'Uber' }` → assert only Uber trips in `trips[]`; costs, fuelLogs, workSessions, goals unaffected by platform filter.

### Implementation for User Story 5

- [ ] T054 [US5] Define `ExportEnvelope` and `ExportFilters` types in `src/types/ExportEnvelope.ts` per FR-014 (exportedAt, filters, trips[], costs[], fuelLogs[], workSessions[], goals[])
- [ ] T055 [US5] Implement `ExportDataAsJSON` use case in `src/application/use-cases/ExportDataAsJSON.ts`: accept optional `{ dateRange?, platform? }`, validate date range if provided (from ≤ to), fetch all entities with applied filters, return `ExportEnvelope` with `exportedAt: new Date().toISOString()` and all monetary values at 2 decimal places (depends on T018, T026, T034, T042, T049, T054)

**Checkpoint**: 30-day export (~300 trips, 150 costs, 30 fuel logs) returns complete envelope with correct filter application (SC-004).

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Supporting entities (Vehicle, User), schema wiring, Drizzle migration generation, and in-memory fakes for use case testing.

- [ ] T056 [P] Create `Vehicle` entity type in `src/domain/entities/Vehicle.ts` and `IVehicleRepository` interface in `src/domain/repositories/IVehicleRepository.ts`
- [ ] T057 [P] Create `vehicles` Drizzle schema in `src/infra/db/schema/vehicles.ts` and `DrizzleVehicleRepository` in `src/infra/repositories/DrizzleVehicleRepository.ts`
- [ ] T058 [P] Create `User` entity type in `src/domain/entities/User.ts` and `users` Drizzle schema in `src/infra/db/schema/users.ts` (no repository needed in MVP — entity definition only per spec Assumptions)
- [ ] T059 Create schema barrel `src/infra/db/schema/index.ts` re-exporting all table definitions; run `npx drizzle-kit generate` to produce initial migration in `src/infra/db/migrations/`
- [ ] T060 Wire `initializeDatabase()` call in app entry point (e.g., `app/_layout.tsx`) and verify migration applies successfully on Android emulator startup
- [ ] T061 [P] Create `InMemoryTripRepository` in `tests/fakes/InMemoryTripRepository.ts` implementing `ITripRepository` with `Map<string, Trip>` backing store
- [ ] T062 [P] Create `InMemoryCostRepository` in `tests/fakes/InMemoryCostRepository.ts` implementing `ICostRepository`
- [ ] T063 [P] Create `InMemoryFuelLogRepository` in `tests/fakes/InMemoryFuelLogRepository.ts` implementing `IFuelLogRepository` (including `findByFuelTypeOrderedByOdometer`)
- [ ] T064 [P] Create `InMemoryWorkSessionRepository` in `tests/fakes/InMemoryWorkSessionRepository.ts` implementing `IWorkSessionRepository` (including `findActive`)
- [ ] T065 [P] Create `InMemoryGoalRepository` in `tests/fakes/InMemoryGoalRepository.ts` implementing `IGoalRepository`

**Final Checkpoint**: `npx jest src/` passes all use case tests using in-memory fakes (SC-001). `npx tsc --noEmit` passes. App starts on Android emulator without migration errors.

---

## Dependencies (User Story Completion Order)

```
Phase 1 (Setup)
    └── Phase 2 (Foundational)
            ├── Phase 3 (US1+US8, P1) ──┐
            ├── Phase 4 (US2, P1) ───────┼── Phase 6 (US4, P2) ──┐
            ├── Phase 5 (US3, P2) ───────┘                        │
            ├── Phase 7 (US6, P3)                                  │
            ├── Phase 8 (US7, P3) ──────────────────────────────── Phase 9 (US5, P3)
            └── Phase 10 (Polish) — can begin after Phase 2
```

## Parallel Execution Examples

**Phase 3 parallelisable**: T016 (Zod schema) ‖ T017 (entity type) → then T018 (interface) → T019 (schema) ‖ T021 (CreateTrip) → T020 (repository)

**Phase 4 parallelisable**: T024 (Zod) ‖ T025 (entity) → T026 (interface) → T027 (schema) ‖ T029 (CreateCost) → T028 (repository)

**Phases 3 and 4 fully parallel** with each other after Phase 2 is complete.

**Phase 10 all [P] tasks** are independent of each other — run concurrently.

## Implementation Strategy

**MVP scope**: Complete Phases 1–6 first. This delivers the full financial tracking core (trips, costs, fuel, dashboard) which maps to all P1 and P2 user stories.

**Second increment**: Phases 7–9 (work sessions, goals, export) — all P3, independent of each other.

**Final**: Phase 10 (polish + in-memory fakes) — validates the entire layer is testable without a device.

**Total tasks**: 65 | **Parallelisable**: 26 [P] | **Phases**: 10
