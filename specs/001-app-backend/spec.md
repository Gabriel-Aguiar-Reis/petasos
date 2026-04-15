# Feature Specification: App Backend — Clean Architecture Domain & Data Layer

**Feature Branch**: `feat/001-app-backend`
**Created**: 2026-04-15
**Status**: Draft
**Input**: User description: "crie a spec do backend da aplicação com base na constitution e no init.md"

## Clarifications

### Session 2026-04-15

- Q: É `Earning` uma entidade de domínio separada ou apenas um campo monetário em `Trip`? → A: `earnings` é um campo monetário de `Trip`; não existe entidade `Earning` independente. FR-001 corrigido.
- Q: Como o sistema determina o fim de período de um `Goal` (daily/weekly/monthly)? → A: O limite de período é derivado de `type` + `periodStart` sem campo `periodEnd` explícito — daily = mesmo dia calendário, weekly = periodStart + 7 dias, monthly = último dia do mês de periodStart.
- Q: A operação `update` está no escopo das interfaces de repositório do MVP? → A: Sim; drivers precisam corrigir entradas manuais. `update` é incluído em FR-002 para todas as entidades editáveis (Trip, Cost, FuelLog, Goal).
- Q: Qual é a estrutura do JSON produzido por `ExportDataAsJSON`? → A: Envelope com chaves top-level por tipo de entidade (`trips`, `costs`, `fuelLogs`, `workSessions`, `goals`) mais metadados `exportedAt` (ISO 8601) e `filters` aplicados.
- Q: Criptografia do SQLite local é necessária no MVP? → A: Não requerida no MVP — o sandboxing de aplicativo do Android é suficiente. Deferida como consideração de segurança Post-MVP.

### Session 2026-04-15 (round 2)

- Q: Goal mede ganhos brutos (earnings) ou lucro líquido (earnings − costs)? → A: Ganhos brutos — `amount achieved = total earnings` no período. Custos não afetam o progresso do goal. US7-AC1 e FR-011 corrigidos.
- Q: O que define logs de combustível "consecutivos" para cálculo de km/L — ordem de data ou de odômetro? → A: Ordem de odômetro crescente (grandeza física monotônica). Se dois logs tiverem a mesma data, o de maior odômetro é o mais recente. A validação de odômetro decrescente já previne ambiguidades. km/L é calculado apenas entre logs do mesmo tipo de combustível (FR-019).
- Q: "Manual earnings adjustment" em US8 é um terceiro tipo de entrada no overlay ou está fora de escopo? → A: Fora de escopo no MVP — `earnings` sempre derivam de um `Trip`. A descrição de US8 foi corrigida para referenciar apenas Trip e Cost como tipos de quick-entry.
- Q: O que acontece com métricas calculadas (dashboard, goal progress, export) quando um registro é deletado? → A: Registros deletados são excluídos imediatamente de todos os cálculos; nenhuma operação de undo está no escopo do MVP.
- Q: Os erros dos use cases são tipados ou genéricos? → A: 4 tipos distintos: `ValidationError` (entrada inválida), `StorageError` (falha de leitura/escrita SQLite), `NotFoundError` (entidade inexistente em findById/update/delete), `ConflictError` (ex: sessão de trabalho já ativa). Cada use case declara quais tipos pode emitir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Record a Trip with Earnings (Priority: P1)

A driver completes a ride on any platform (Uber, 99, InDrive, etc.) and registers the trip:
origin, destination, distance, duration, earnings, and platform. The data is saved locally
and immediately available for dashboard and export use cases — no internet required.

**Why this priority**: Trips and earnings are the primary revenue data. Without them, the
dashboard, profit calculation, and export features have nothing to operate on. This is the
core unit of value for the entire application.

**Independent Test**: Can be fully tested by creating a trip entity, persisting it through
the repository, and retrieving it — delivering a functional earnings record with platform attribution.

**Acceptance Scenarios**:

1. **Given** a driver has no active internet connection, **When** they create a trip with valid fields (origin, destination, distance ≥ 0, duration ≥ 0, earnings ≥ 0, platform identifier), **Then** the trip is persisted in local storage and retrievable by its ID
2. **Given** an existing trip record, **When** the driver queries trips by platform, **Then** only trips matching that platform identifier are returned
3. **Given** two trips on different platforms, **When** the dashboard summary use case runs, **Then** total earnings reflect the sum of both trips' earnings fields
4. **Given** a trip creation with a missing required field, **When** the use case validates the input, **Then** a validation error is returned and no record is persisted

---

### User Story 2 — Log a Cost (Priority: P1)

A driver records an operational expense: fuel, maintenance, food, parking/tolls, or a custom
category. The cost is associated with a date and saved locally for profit calculation.

**Why this priority**: Costs are the second pillar of the profit equation (profit = earnings − costs).
Without cost data, the dashboard is meaningless and the app fails its primary goal.

**Independent Test**: Can be tested by creating a cost entry through the use case and verifying
it is retrievable and included in the total-cost calculation for the dashboard summary.

**Acceptance Scenarios**:

1. **Given** a driver enters a cost with amount, category, and date, **When** the create-cost use case executes, **Then** the record is persisted and the total costs for that date increase by the entered amount
2. **Given** a custom category label, **When** the driver saves a cost with that label, **Then** the record is stored with the exact custom category string
3. **Given** multiple costs on different dates, **When** the driver filters by a specific date range, **Then** only costs within that range are returned

---

### User Story 3 — Track Fuel (Priority: P2)

A driver logs a fuel fill-up: fuel type, liters purchased, total price paid, and current odometer reading.
The system derives km/L and cost-per-km per fuel type automatically from the stored data.

**Why this priority**: Fuel is both the largest recurring cost and a key efficiency metric.
Fuel tracking is an MVP requirement per the constitution.

**Independent Test**: Can be tested by inserting two consecutive fuel logs of the same fuel type and verifying
that the system correctly calculates the km/L efficiency between them.

**Acceptance Scenarios**:

1. **Given** a driver logs a fuel fill with fuel type, liters, total price, and odometer reading, **When** the create-fuel-log use case executes, **Then** the record is persisted with price-per-liter derived automatically
2. **Given** two consecutive fuel logs of the same fuel type with different odometer values, **When** the fuel efficiency use case runs, **Then** km/L is calculated as (odometer_new − odometer_old) / liters_new
3. **Given** only one fuel log of a given type exists (no previous odometer reference for that type), **When** efficiency is queried for that type, **Then** km/L is returned as null/unavailable with no error thrown
4. **Given** logs of both Gasolina and Etanol exist, **When** the fuel efficiency use case runs, **Then** km/L is reported separately per fuel type; no cross-type calculation is performed

---

### User Story 4 — View Dashboard Summary (Priority: P2)

A driver opens the app and sees their financial summary for the current day: total earnings,
total costs, net profit, and fuel efficiency. All values are computed from local data.

**Why this priority**: The dashboard is the primary motivator for daily usage. It must reflect
accurate, real-time data from the local store to drive behaviour change.

**Independent Test**: Can be tested by seeding trips, costs, and fuel logs for a known date,
then calling the get-dashboard-summary use case and asserting the returned values match expected calculations.

**Acceptance Scenarios**:

1. **Given** trips and costs recorded on the current date, **When** the get-dashboard-summary use case runs for today, **Then** it returns total earnings, total costs, and net profit (earnings − costs) correctly
2. **Given** no data for the current date, **When** the dashboard summary is requested, **Then** all monetary values return as zero without errors
3. **Given** trips across multiple platforms, **When** the summary is requested, **Then** earnings are broken down per platform as well as in total

---

### User Story 5 — Export All Data as JSON (Priority: P3)

A driver exports all their recorded data (trips, costs, fuel logs, work sessions, goals) as a
single JSON file, optionally filtered by date range and/or platform. The export is available
entirely offline.

**Why this priority**: Data ownership is a constitutional principle and a P3 MVP requirement.
Without export, the driver cannot migrate their data or use it outside the app.

**Independent Test**: Can be tested by inserting representative records across all entities,
running the export-data use case with no filters, and verifying every record appears in the
output JSON with no data loss.

**Acceptance Scenarios**:

1. **Given** records across all entities, **When** the driver exports without filters, **Then** the JSON output includes all records from all entity types with no omissions
2. **Given** records spanning two months, **When** the driver exports with a date range of one month, **Then** only records within that range appear in the export
3. **Given** trips across two platforms, **When** the driver exports filtering by one platform, **Then** only trips (and earnings linked to that platform) appear in the trip list; costs and fuel logs are unaffected by platform filter

---

### User Story 6 — Track Work Session (Priority: P3)

A driver clocks in at the start of their shift and clocks out at the end. The system records
start and end times, enabling total active hours calculation.

**Why this priority**: Work session duration is required to compute profit-per-hour, a key
metric in the init.md definition of success. It is a lower-priority MVP feature since it
enhances but does not block the core financial tracking.

**Independent Test**: Can be tested by starting a session, ending it, and verifying the
persisted record contains both timestamps, with no open sessions remaining after clock-out.

**Acceptance Scenarios**:

1. **Given** a driver has no active session, **When** they clock in, **Then** a work session record is created with the current start time and no end time
2. **Given** an active session, **When** the driver clocks out, **Then** the session record is updated with the end time
3. **Given** an active session already open, **When** the driver attempts to clock in again, **Then** the use case returns an error indicating a session is already in progress

### User Story 7 — Set Financial Goal (Priority: P3)

A driver sets a financial goal (e.g., earn $100 today). The system tracks progress towards that goal based on recorded trips and costs.

**Why this priority**: Goal-setting is a motivational feature that encourages drivers to use the app daily. It is a P3 MVP feature since it enhances engagement but does not block core financial tracking.

**Independent Test**: Can be tested by creating a goal, recording trips and costs that contribute to that goal, and verifying the get-goal-progress use case returns the correct percentage progress.

**Acceptance Scenarios**:

1. **Given** a driver sets a daily goal of $100, **When** they record trips for that day, **Then** the get-goal-progress use case returns progress as `total earnings / targetAmount × 100%`, capped at 100%; costs do not affect goal progress
2. **Given** a weekly goal with a periodStart of Monday, **When** the driver records trips throughout the week, **Then** progress is calculated based on total earnings from that Monday to the current date
3. **Given** a monthly goal with a periodStart of the 1st of the month, **When** the driver records trips, **Then** progress is calculated based on total earnings from the 1st to the current date, regardless of month length

---

### User Story 8 — Quick-Entry via Persistent Overlay Button (Priority: P1)

A driver, at any point while using the app, taps a persistent circular button that floats over
the current screen. A compact entry panel appears, allowing them to register a trip or a cost
with the minimum possible fields. The record is saved immediately without navigating away
from the current screen.

**Why this priority**: The constitutional constraint of ≤ 3 taps for key actions cannot be
met without a persistent shortcut that bypasses multi-level navigation. Drivers register
records between rides — speed is critical. This is P1 because it directly conditions the
usability of US1 and US2.

**Independent Test**: Can be tested by triggering the quick-entry flow with only mandatory
fields filled (earnings + platform for a trip; amount + category for a cost), confirming
the record is persisted and the driver is returned to their previous screen with no data loss.

**Acceptance Scenarios**:

1. **Given** the driver is on any screen, **When** they tap the persistent circular button, **Then** a compact overlay panel is displayed without navigating away from the current screen
2. **Given** the overlay is open with entry type "Trip", **When** the driver fills only earnings and platform and confirms, **Then** a trip record is created with those fields; remaining fields (origin, destination, distance, duration) are nullable and default to null
3. **Given** the overlay is open with entry type "Cost", **When** the driver fills only amount and category and confirms, **Then** a cost record is created with today's date as default
4. **Given** a quick-entry record is saved, **When** the driver opens the full trip or cost list, **Then** the quick-entry record appears alongside normally created records with no distinction in the data model
5. **Given** the driver dismisses the overlay without saving, **When** no data was entered, **Then** no record is created and the previous screen state is unchanged

---

### Edge Cases

- What happens when a trip is created with earnings = 0 (e.g., cancelled ride with no pay)?
  → Record must be accepted; zero-value entries are valid
- What happens when the odometer reading in a fuel log is less than the previous log of the same fuel type?
  → Use case must return a validation error (odometer cannot decrease); logs of different fuel types do not constrain each other's odometer sequence
- What happens when a date-range export filter has start date after end date?
  → Use case must return a validation error before querying storage
- What happens when the local SQLite file is corrupted or unreadable?
  → Repository must surface a typed storage error that the UI layer can handle gracefully
- What happens if the driver tries to clock in while already having an active session?
  → Use case must return a clear error indicating a session is already in progress; no new session is created
- What happens if the driver tries to clock out without an active session?
  → Use case must return a clear error indicating no active session exists; no session is modified
- What happens if the driver sets a goal with a targetAmount of zero or negative?
  → Use case must return a validation error indicating targetAmount must be positive; no goal is created
- What happens if the driver tries to update a trip to have negative earnings?
  → Use case must return a validation error indicating earnings cannot be negative; trip is not updated
- What happens if the driver tries to update a cost to have a negative amount?
  → Use case must return a validation error indicating amount cannot be negative; cost is not updated
- What happens if the driver tries to create a fuel log with zero liters?
  → Use case must return a validation error indicating liters must be greater than zero; fuel log is not created
- What happens when the driver alternates between Gasolina and Etanol on the same vehicle (flex engine)?
  → Each fuel type maintains its own independent odometer sequence for km/L calculation; logs of different fuel types are stored together but efficiency is always computed per fuel type
- What happens when a quick-entry trip is submitted with only earnings and platform (other fields null)?
  → Record MUST be persisted; optional fields (origin, destination, distance, duration) stored as null; dashboard calculations MUST handle null distance gracefully (exclude from km-based metrics)
- What happens if the quick-entry overlay is open and the app is backgrounded then foregrounded?
  → The overlay state (entered data) MUST be preserved for the session duration; no partial record is auto-saved

## Requirements *(mandatory)*

### Functional Requirements

**Domain Layer**

- **FR-001**: System MUST define domain entities for: `Trip`, `Cost`, `FuelLog`, `WorkSession`, `Goal`, and `Vehicle`, with typed value objects and no dependency on any framework or infrastructure library. `earnings` is a monetary field on `Trip`, not a separate entity.
- **FR-002**: System MUST define repository interfaces in the domain layer for each entity, exposing create, findById, findAll (with optional filters), update, and delete operations. Update is supported for Trip, Cost, FuelLog, and Goal to allow drivers to correct manual entries.
- **FR-003**: Use cases MUST be the sole orchestrators of business logic; no UI component or repository implementation may contain business rules
- **FR-004**: System MUST implement the following use cases in the domain layer:
  - `CreateTrip` (supports quick-entry with nullable optional fields), `UpdateTrip`, `GetTripsByFilter`
  - `CreateCost` (supports quick-entry with today's date as default), `UpdateCost`, `GetCostsByFilter`
  - `CreateFuelLog`, `GetFuelEfficiency`
  - `StartWorkSession`, `EndWorkSession`
  - `SetGoal`, `GetGoalProgress`
  - `GetDashboardSummary`
  - `ExportDataAsJSON`

**Data Layer**

- **FR-005**: System MUST implement Drizzle ORM table schemas that exactly reflect the domain entity structure for: `users`, `vehicles`, `trips`, `costs`, `fuel_logs`, `work_sessions`, `goals`
- **FR-006**: System MUST provide SQLite-backed repository implementations that fulfil every domain repository interface
- **FR-007**: All write operations MUST succeed without network access; no operation may depend on an external service

**Business Logic**

- **FR-008**: `GetDashboardSummary` MUST return: total earnings, total costs, net profit (earnings − costs), and earnings breakdown by platform for a given date range
- **FR-009**: `GetFuelEfficiency` MUST calculate km/L using fuel logs ordered by odometer value ascending (not by date). "Consecutive" means the two logs with adjacent odometer readings. km/L = (odometer_higher − odometer_lower) / liters_of_higher_log. Returns null when fewer than two logs exist.
- **FR-010**: Cost-per-km MUST be derivable from total costs and total distance across all trips for any given date range
- **FR-011**: `GetGoalProgress` MUST return progress as a percentage (`total earnings in period / targetAmount × 100`), capped at 100%. Costs do not affect goal progress — goals measure gross earnings only. The period boundary is derived from `type` + `periodStart`: daily = same calendar day, weekly = periodStart + 7 days, monthly = last day of periodStart's calendar month. No explicit `periodEnd` field is stored.
- **FR-012**: All ride platforms MUST be represented as free-form string identifiers; no platform names MUST be hard-coded in domain or data layers
- **FR-013**: `ExportDataAsJSON` MUST accept optional filters: `dateRange: { from: Date, to: Date }` and `platform: string`; when omitted, all records are included
- **FR-014**: The JSON output of `ExportDataAsJSON` MUST follow this envelope structure: `{ exportedAt: string (ISO 8601), filters: { dateRange?, platform? }, trips: Trip[], costs: Cost[], fuelLogs: FuelLog[], workSessions: WorkSession[], goals: Goal[] }`. All monetary values MUST be serialized as numbers with 2 decimal places.
- **FR-015**: SQLite data encryption at rest is NOT required for MVP. Android app sandboxing provides sufficient isolation. This requirement is deferred to Post-MVP.
- **FR-016**: `CreateTrip` MUST accept a quick-entry mode where only `earnings` and `platform` are required; `origin`, `destination`, `distance`, and `duration` are explicitly nullable. `CreateCost` MUST accept a quick-entry mode where only `amount` and `category` are required; `date` defaults to the current calendar day when omitted. Both use cases MUST apply identical validation rules regardless of entry mode. "Manual earnings adjustment" is not a quick-entry type in MVP — earnings are always derived from a Trip record.
- **FR-017**: All use cases MUST communicate failures using exactly four typed error types: `ValidationError` (invalid or missing input fields), `StorageError` (SQLite read/write failure), `NotFoundError` (entity not found in findById, update, or delete), and `ConflictError` (business rule violation, e.g., starting a session when one is already active). No generic or untyped errors are permitted at the domain boundary.
- **FR-018**: `delete` operations on Trip, Cost, FuelLog, WorkSession, and Goal MUST cause the deleted record to be immediately excluded from all computed outputs: dashboard summary, goal progress, fuel efficiency, and JSON export. No undo mechanism is provided in MVP.
- **FR-019**: `FuelLog` MUST include a `fuelType` field as a free-form string identifier (e.g. "Gasolina", "Etanol", "Diesel", "GNV"). `GetFuelEfficiency` MUST compute km/L and price-per-km separately per fuel type, using only consecutive logs of the same `fuelType` ordered by odometer ascending. Cross-type efficiency calculations MUST NOT be performed. The `fuelType` field is required on `CreateFuelLog` and cannot be null.

### Key Entities

- **Vehicle**: Represents a driver's car — attributes: id, name, plate
- **Trip**: A completed ride — attributes: id, date, earnings (monetary field, not a separate entity), distance (km, nullable), duration (minutes, nullable), platform (string identifier), origin (nullable), destination (nullable), vehicleId (optional)
- **Cost**: An operational expense — attributes: id, date, amount, category (enum of standard categories + free-form custom string)
- **FuelLog**: A fuel fill-up event — attributes: id, date, fuelType (string identifier, e.g. "Gasolina", "Etanol", "Diesel", "GNV"; free-form to support regional variants), liters, totalPrice, odometer (km); derived: pricePerLiter
- **WorkSession**: A driver's active shift — attributes: id, startTime, endTime (nullable while active)
- **Goal**: A financial target — attributes: id, type (daily | weekly | monthly), targetAmount, periodStart; period end is derived (not stored) based on type

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All domain use cases can be exercised in a test environment with zero app launch or device dependency — pure in-memory repository stubs are sufficient
- **SC-002**: Adding a new ride platform requires zero changes to domain or data layer code — only a new string identifier at the call site
- **SC-003**: A complete driver workday — 10 trips, 5 costs, 1 fuel log, 1 work session — is stored and fully retrievable in under 200 ms on an average Android device
- **SC-004**: JSON export of 30 days of data (≈ 300 trips, 150 costs, 30 fuel logs) produces a valid, complete JSON file with correct date and platform filters applied
- **SC-005**: Dashboard summary calculations (profit, km/L, cost per km) return values that exactly match manual calculations for any given seed dataset — zero rounding discrepancy above 2 decimal places
- **SC-006**: A work session that was started but never closed does not corrupt subsequent session creation — the error path is clean and recoverable
- **SC-007**: A quick-entry trip (earnings + platform only) and a quick-entry cost (amount + category only) are each persistable in a single use case call; the resulting records are indistinguishable from full-entry records in the data layer and appear correctly in dashboard and export outputs

## Assumptions

- The app targets Android only for MVP; no iOS-specific data layer adaptations are required
- A single `user` is assumed per device; multi-user support is explicitly out of scope for MVP
- Vehicle association on trips is optional in MVP; the `vehicleId` field is nullable
- Earnings are always associated with a trip; standalone earning entries (not linked to a trip) are out of scope for MVP
- The `users` table exists in the schema but user management (sign-up, login, profile editing) is out of scope for this spec — only the entity definition is in scope
- Cost categories follow a predefined list (fuel, maintenance, food, parking/tolls) plus a free-form custom string; the predefined list is enumerable at the domain level
- Conflict resolution strategy is last-write-wins (initial implementation, per init.md Section 7)
- Cloud sync and the sync queue are Post-MVP; no sync-related abstractions are introduced in this spec
- SQLite data encryption at rest is Post-MVP; Android app sandboxing is the security boundary for MVP
