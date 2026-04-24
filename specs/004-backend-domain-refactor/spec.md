# Feature Specification: Backend Domain Refactor — Extended Domain Model & Pure Functions

**Feature Branch**: `004-backend-domain-refactor`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "veja que fiz um arquivos com mudanças para a codebase, muito direcionadas ao backend que foi construído usando o 001-app-backend, quero que crie uma spec 004 e promova as mudanças"

## Overview

This feature expands and refines the domain model established in `001-app-backend`. The goal is to cover a wider range of operational data that a rideshare/delivery driver needs to track — fuel types, vehicle details, recurring costs, maintenance schedules, reminders, planned absences, calendar events, trip offer evaluation, and per-platform profit goals — while keeping the domain layer completely free of external dependencies.

All new entities follow the same clean architecture established in `001`: pure domain types, repository interfaces (ports) in the domain layer, and implementations (adapters) in the infrastructure layer. Recurrence rules are stored as RFC 5545 strings; date expansion is the responsibility of the application/infrastructure layer.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Register Vehicle with Full Details (Priority: P1)

A driver registers their vehicle(s) providing brand, model, year, fuel type, and vehicle type. When navigating to the fuel log or trips section, the system suggests the last recorded mileage for the selected vehicle so the driver does not need to retype it.

**Why this priority**: Vehicle identity underlies all cost, fuel, trip, and maintenance records. Without a fully modelled vehicle, fuel-type-specific consumption tracking and per-vehicle maintenance are impossible.

**Independent Test**: Can be fully tested by creating a `VehicleType`, a `FuelType`, and a `Vehicle` with all new fields, persisting them, and verifying retrieval and last-mileage suggestion.

**Acceptance Scenarios**:

1. **Given** a driver wants to register a vehicle, **When** they provide brand, model, year, fuel type, and vehicle type, **Then** the vehicle is saved and retrievable with all supplied fields intact
2. **Given** multiple odometer readings for a vehicle, **When** the driver opens the trip or fuel log form, **Then** the last recorded mileage value is pre-filled as a starting point
3. **Given** a vehicle with an associated fuel type, **When** the driver opens the fuel log form, **Then** the fuel type field defaults to the vehicle's primary fuel type
4. **Given** a missing required field (name, plate, brand, model, year, fuelTypeId, typeId), **When** the use case validates the input, **Then** a validation error is returned and no vehicle is persisted

---

### User Story 2 — Evaluate Trip Offer in Real Time (Priority: P1)

Before accepting a ride offer, the driver sees a compact indicator (pill) showing the estimated net profit, total time (deadhead + trip), percentage of the active goal, and a color signal. The driver can accept or reject the offer with this information without opening the main app.

**Why this priority**: Real-time offer evaluation is a primary differentiator of the app. It directly influences the driver's income by helping them reject unprofitable trips.

**Independent Test**: Can be tested by supplying a `TripOfferRecord`, vehicle consumption, fuel price, and active goal to the `evaluateTripOfferPill` function and verifying the returned state (profit, duration, goal percentage, color).

**Acceptance Scenarios**:

1. **Given** a trip offer with fare, distances, and durations, **When** the evaluation runs with the last recorded fuel price and the vehicle's average consumption, **Then** the estimated net profit equals fare minus (total distance / consumption × price per liter) minus tolls
2. **Given** an active daily profit goal of R$ 200 and an estimated profit of R$ 240, **When** the thresholds are 15% orange and 20% blue, **Then** the pill color is blue (240 / 200 = 120%, above 120%)
3. **Given** an estimated profit of R$ 180 against a goal of R$ 200, **When** the orange threshold is 15%, **Then** the pill color is orange (90% ≥ 85% and < 100%)
4. **Given** an estimated profit below the orange threshold, **When** evaluated, **Then** the pill color is red
5. **Given** no active goal configured, **When** the evaluation runs, **Then** the pill displays values with neutral color (no colorization)
6. **Given** a passenger with a rating of 3.8 and a `redBelow` threshold of 4.0, **When** evaluated, **Then** the rating indicator color is red

---

### User Story 3 — Log Fuel with Type and Price History (Priority: P1)

A driver refuels their vehicle and records the event: fuel type, liters added, price per liter, and odometer readings. The system calculates average consumption automatically. The last recorded price for each fuel type is remembered and used by the offer evaluator.

**Why this priority**: Accurate fuel cost tracking is the foundation of the profit calculation. Without per-type fuel prices and consumption, the trip offer pill cannot estimate profitability.

**Independent Test**: Can be tested by creating a `FuelConsumptionRecord` and verifying that `calculateAverageConsumption` returns the correct km/L value, and that the last `FuelPriceRecord` for that fuel type is retrievable.

**Acceptance Scenarios**:

1. **Given** start and end odometer readings plus liters added, **When** the driver saves the refuel record, **Then** average consumption (km/L) is stored correctly
2. **Given** an optional fuel gauge reading before and after refueling plus total tank capacity, **When** those values are supplied, **Then** the consumption calculation uses the adjusted fuel amount for higher accuracy
3. **Given** the driver enters the total amount paid instead of liters, **When** they also provide the price per liter, **Then** the system calculates the liter quantity automatically
4. **Given** multiple fuel types registered, **When** the driver records a refuel, **Then** they can select the specific fuel type; price records are stored per type independently

---

### User Story 4 — Create Recurring Costs (Priority: P2)

A driver registers an annual IPVA tax or a monthly insurance payment once and the system knows to repeat it at the configured interval. Exceptions (months the cost didn't occur) can be noted.

**Why this priority**: Recurring costs significantly impact the annual profit calculation. Without recurrence, the driver must manually re-enter the same costs every period, leading to missed records.

**Independent Test**: Can be tested by creating a `Cost` with a recurrence rule and verifying that the application layer expands it to the correct set of dates, respecting configured exceptions.

**Acceptance Scenarios**:

1. **Given** a cost with a monthly recurrence rule, **When** the driver queries costs for a given month, **Then** the recurring cost appears in that month's list even if created in a prior month
2. **Given** a recurring cost with an exception date, **When** the month of the exception is queried, **Then** the cost does not appear for that date
3. **Given** a recurring cost with an end date, **When** a date after the end is queried, **Then** the cost does not appear
4. **Given** a cost without a recurrence field, **When** queried, **Then** it appears only on its original date

---

### User Story 5 — Schedule and Track Vehicle Maintenance (Priority: P2)

A driver schedules an oil change at 5,000 km and records the actual cost when it is done. Both date-based and mileage-based triggers are supported. Completed maintenance is distinguishable from upcoming maintenance.

**Why this priority**: Maintenance is a major operational cost category. Scheduled maintenance prevents breakdowns and unexpected expenses, and accurate tracking improves annual cost reporting.

**Independent Test**: Can be tested by creating a `Maintenance` record with a mileage trigger, persisting it, and verifying retrieval and status (completed vs. pending).

**Acceptance Scenarios**:

1. **Given** a maintenance record with a mileage trigger, **When** the current odometer reading exceeds the trigger mileage, **Then** the maintenance appears in the "upcoming/due" list
2. **Given** a maintenance record with a date trigger, **When** the trigger date is reached or passed, **Then** the maintenance appears as due
3. **Given** a completed maintenance, **When** `completedAt` and `actualCost` are filled, **Then** it no longer appears in the pending list and its actual cost is included in cost totals
4. **Given** a maintenance record without required fields (vehicleId, name, trigger, estimatedCost), **When** creation is attempted, **Then** a validation error is returned

---

### User Story 6 — Plan Days Off and Vacations (Priority: P2)

A driver marks a week as vacation. The app knows not to count those days as missed earnings. If the driver works during a vacation day, they can record a trip normally — the absence is partially overridden without being cancelled.

**Why this priority**: Without absence planning, the app cannot distinguish intentional rest from days with no recorded trips, making weekly/monthly performance stats misleading.

**Independent Test**: Can be tested by creating a `PlannedAbsence` of type `vacation` and verifying that querying work expectations for those dates reflects the absence, while a day listed in `workedDays` is treated as a worked day.

**Acceptance Scenarios**:

1. **Given** a vacation period, **When** the driver records a trip on a day within that period without adding it to `workedDays`, **Then** the day is still counted as an absence for stats purposes
2. **Given** a vacation period with a specific day in `workedDays`, **When** stats are calculated, **Then** that day is counted as worked
3. **Given** a `day_off` absence, **When** `endDate` is provided, **Then** a validation error is returned (day\*off must be a single day)
4. **Given** a cancelled absence (`cancelledAt` filled), **When** absence list is queried, **Then** the absence is visible but marked as cancelled

---

### User Story 7 — View Official Holidays and Custom Events (Priority: P2)

The app pre-loads Brazilian official holidays for the current year automatically on first launch. The driver can also add custom personal events. Holidays are shown on calendar views to give context when planning work days.

**Why this priority**: Holidays affect demand on rideshare platforms. Knowing upcoming holidays helps drivers decide when to work. Keeping this data fresh (yearly sync) ensures accuracy.

**Independent Test**: Can be tested by creating `SpecialDay` entries of both `official` and `custom` source and verifying they are retrievable by date range and type.

**Acceptance Scenarios**:

1. **Given** a fresh app installation, **When** internet is available, **Then** official Brazilian holidays for the current year are loaded automatically
2. **Given** a year boundary (December), **When** the app detects the next year's holidays have not been loaded, **Then** a sync attempt is made for the next year
3. **Given** offline usage, **When** the holidays sync fails, **Then** the app continues functioning with previously cached holiday data
4. **Given** a driver-created custom event, **When** the calendar is displayed, **Then** the custom event appears alongside official holidays with a visual distinction

---

### User Story 8 — Set Reminders with Optional Recurrence (Priority: P3)

A driver creates a reminder for their annual vehicle license renewal with a yearly recurrence and alarm enabled. The reminder fires as a notification on the configured date.

**Why this priority**: Reminders are a quality-of-life feature. They reduce the risk of the driver missing important deadlines (license renewal, insurance payment) but do not block core functionality.

**Independent Test**: Can be tested by creating a `Reminder` entity with a recurrence rule and verifying that persistence and retrieval work correctly.

**Acceptance Scenarios**:

1. **Given** a reminder with a yearly recurrence, **When** the year advances, **Then** the reminder recurs on the same calendar date each year
2. **Given** a reminder with `alarm: true`, **When** the reminder date arrives, **Then** a notification is scheduled for that date
3. **Given** a reminder without recurrence, **When** created and retrieved, **Then** it appears exactly once on its configured date

---

### User Story 9 — Configure App Preferences (Priority: P3)

A driver sets their preferred unit (km/L or L/100km), currency, and trip offer pill thresholds once. These preferences persist across sessions.

**Why this priority**: Preferences are infrastructure for personalization. Wrong units or missing thresholds degrade the offer pill experience, but the app remains functional without them.

**Independent Test**: Can be tested by persisting `UserSettings` and verifying all fields are retrievable and applied to subsequent calculations.

**Acceptance Scenarios**:

1. **Given** a driver sets `preferredUnits` to `l/100km`, **When** fuel consumption is displayed, **Then** values are presented in the configured unit
2. **Given** configured trip offer pill thresholds, **When** an offer is evaluated, **Then** the color logic uses the driver's custom percentages
3. **Given** a driver with no settings saved, **When** the app starts, **Then** sensible defaults are applied (BRL currency, km/L units, no colorization thresholds)

---

### Edge Cases

- What happens when `startMileage >= endMileage` in a fuel consumption record? → validation error: distance must be positive
- How does the system handle a `PlannedAbsence` of type `vacation` where `endDate < date`? → validation error: end date must be after or equal to start date
- What if BrasilAPI is unavailable during the holiday sync? → app operates with previously loaded data; sync retried on next launch
- What if the driver has no active goal when a trip offer arrives? → pill shows values with neutral color, no goal percentage
- What if `fuelAdded <= 0` in a consumption record? → validation error: fuel added must be positive
- What if a `TripPlatform` referenced by a `Trip` is deleted? → deletion is blocked while trips reference it (referential integrity constraint)
- What happens when `calculateProfit` receives `distance <= 0`? → validation error: trip distance must be positive

---

## Requirements \*(mandatory)\_

### Functional Requirements

**Reference types and lookup entities**

- **FR-001**: System MUST allow creation, update, and deletion of `FuelType` entries (name, optional description and tags)
- **FR-002**: System MUST allow creation, update, and deletion of `VehicleType` entries (name, optional description and tags)
- **FR-003**: System MUST allow creation, update, and deletion of `TripPlatform` entries; existing `Trip.platform` string fields MUST be migrated to reference `TripPlatform.id`

**Vehicle**

- **FR-004**: `Vehicle` MUST include `brand`, `model`, `year`, `fuelTypeId` (FK → FuelType), `typeId` (FK → VehicleType), and optional `color` and `notes`
- **FR-005**: System MUST provide a use case to retrieve the last `MileageRecord` for a given vehicle, for pre-filling forms

**Odometer & Fuel History**

- **FR-006**: System MUST allow recording `MileageRecord` entries (vehicleId, date, mileage, optional notes)
- **FR-007**: System MUST allow recording `FuelPriceRecord` entries (fuelTypeId, date, pricePerLiter, optional notes)
- **FR-008**: System MUST allow recording `FuelConsumptionRecord` entries; `averageConsumption` MUST be computed via `calculateAverageConsumption` before persistence
- **FR-009**: When `fuelGaugeMeasurement` and `fuelGaugeTotalCapacity` are provided, the consumption calculation MUST use the gauge-adjusted fuel amount

**Costs — Recurrence**

- **FR-010**: `Cost` MUST support an optional `recurrence` field (RFC 5545 RRULE string, optional end date, optional exception dates) and an optional `tags` array
- **FR-011**: The application layer MUST use `rrule.js` to expand recurrence rules into occurrence dates; the domain layer MUST NOT import or depend on `rrule.js`
- **FR-012**: Costs for a date range query MUST include both one-time costs and occurrences generated from recurring costs within that range

**Profit (non-trip earnings)**

- **FR-013**: System MUST allow recording `Profit` entries (date, amount, platformId, optional description, optional tags); `Profit` is independent of `Trip`

**WorkSession — Update**

- **FR-014**: System MUST allow updating `startTime` and `endTime` of an existing `WorkSession` to correct data-entry errors

**Reminders**

- **FR-015**: System MUST allow creating, updating, and deleting `Reminder` entries with date, message, alarm flag, optional recurrence, optional notes, and optional tags
- **FR-016**: When `alarm` is `true`, a notification MUST be scheduled for the reminder's date

**Maintenance**

- **FR-017**: System MUST allow creating, updating, and deleting `Maintenance` records; trigger MUST be either a specific date or a mileage threshold
- **FR-018**: System MUST expose a query to retrieve pending maintenance records (where `completedAt` is null) for a given vehicle
- **FR-019**: When `completedAt` and `actualCost` are set on a `Maintenance` record, the record MUST be marked as completed and included in cost totals for the relevant period

**Special Days & Planned Absences**

- **FR-020**: System MUST synchronize official Brazilian holidays from BrasilAPI on first launch and at each new calendar year transition; sync failures MUST be handled gracefully (silent retry, no crash)
- **FR-021**: System MUST allow creation, update, and deletion of custom `SpecialDay` entries; official entries sourced from BrasilAPI MUST NOT be editable by the user
- **FR-022**: System MUST allow creation, update, and deletion of `PlannedAbsence` entries with type `day_off` (single date) or `vacation` (date range); `endDate` is required for `vacation` and MUST be ≥ `date`
- **FR-023**: `PlannedAbsence` MUST support a `workedDays` list to record partial work during a vacation without cancelling the absence; cancellation is represented by filling `cancelledAt`

**Trip Offer Record & Evaluation**

- **FR-024**: System MUST allow recording `TripOfferRecord` entries (platformId, vehicleId, fare, distances, durations, optional passenger rating, optional notes)
- **FR-025**: `evaluateTripOfferPill` MUST be a pure domain function that computes estimated profit, total duration, goal percentage, profit color, passenger rating, and rating color
- **FR-026**: `createTripFromOffer` MUST be a pure domain function that constructs a pre-filled `Trip` from a `TripOfferRecord` and an actual earnings value

**Goals**

- **FR-027**: System MUST allow creating, updating, and deleting `SavedProfitGoal` entries (name, target amount, optional period, optional tags/notes)
- **FR-028**: System MUST allow creating, updating, and deleting `PlatformProfitGoal` entries (platformId, target amount, optional tags/notes)

**User Settings**

- **FR-029**: System MUST persist `UserSettings` (preferred units, currency, display preferences, optional starred tool, optional trip offer pill thresholds)
- **FR-030**: System MUST expose a use case to read and update `UserSettings`; a default settings object MUST be returned when none is saved

**Domain Purity**

- **FR-031**: All domain entities and pure functions MUST NOT import any Expo, React Native, SQLite, `rrule.js`, or UI library; violations MUST cause CI to fail

### Key Entities

- **FuelType**: Lookup entity identifying a type of fuel (Gasoline, Ethanol, Diesel, Electric, CNG, etc.)
- **VehicleType**: Lookup entity identifying a vehicle category (Car, Motorcycle, Truck, etc.)
- **TripPlatform**: Lookup entity for rideshare/delivery platforms (Uber, 99, InDrive, etc.)
- **Vehicle** _(updated)_: A driver's vehicle, now including brand, model, year, fuel type reference, vehicle type reference, and optional color/notes
- **MileageRecord**: A point-in-time odometer reading for a vehicle
- **FuelPriceRecord**: A point-in-time fuel price record per fuel type
- **FuelConsumptionRecord**: A complete refuel event with mileage span, liters added, optional gauge measurement, and computed average consumption
- **Cost** _(updated)_: Operational expense now supporting an optional RFC 5545 recurrence rule and tags
- **Profit**: A non-trip earnings entry associated with a platform
- **WorkSession** _(updated)_: Existing entity; `startTime` and `endTime` are now updatable
- **Reminder**: A driver-defined reminder with optional recurrence and alarm notification
- **Maintenance**: A vehicle maintenance record with date or mileage trigger, estimated and actual cost, and completion timestamp
- **SpecialDay**: A calendar fact (official holiday, optional day, custom event) with source attribution
- **PlannedAbsence**: The driver's declared intention not to work on a date or date range, with partial-work and cancellation support
- **TripOfferRecord**: A snapshot of a trip offer captured by the overlay, used for real-time evaluation and historical reference
- **SavedProfitGoal**: A named profit target with optional period type
- **PlatformProfitGoal**: A profit target scoped to a specific platform
- **UserSettings**: Per-user preferences including units, currency, display flags, and trip offer pill thresholds

---

## Success Criteria \_(mandatory)\_

### Measurable Outcomes

- **SC-001**: All 14 new/updated entity types are creatable, retrievable, updatable, and deletable through their respective use cases with no data loss
- **SC-002**: `evaluateTripOfferPill` returns the correct color for all 4 profit threshold zones (blue, green, orange, red) and neutral when no goal is active — verified by unit tests with 100% branch coverage
- **SC-003**: `calculateAverageConsumption` returns accurate km/L with and without gauge adjustment — verified by unit tests against known inputs
- **SC-004**: Recurring cost expansions for monthly, weekly, and yearly rules match expected date sequences for a 12-month window — verified by unit tests
- **SC-005**: Holiday sync completes silently on first launch; subsequent launches within the same year skip the sync and return cached data
- **SC-006**: All domain entities and pure functions pass static analysis confirming zero imports from infrastructure or UI libraries
- **SC-007**: All existing tests from `001-app-backend` continue to pass after migration of `Trip.platform` to `Trip.platformId`
- **SC-008**: `WorkSession` update use case allows correcting `startTime` and `endTime` without creating a new record

---

## Assumptions

- The existing SQLite/Drizzle infrastructure from `001-app-backend` is the persistence layer; no new database engine is introduced
- `rrule.js` is added as a dependency in the application/infrastructure layer only; version compatibility with the existing Expo SDK is confirmed before adoption
- BrasilAPI (`https://brasilapi.com.br/api/feriados/v1/{ano}`) is used as the sole source for official Brazilian holidays; its schema (array of `{ date, name, type }`) is considered stable for this feature
- `uuid` (already a dependency) is used for all new entity ID generation
- Monetary values are stored and computed as `number` rounded to 2 decimal places, denominated in the user's configured currency (default: BRL)
- The existing `Trip` entity migration from `platform: string` to `platformId: string` (FK) includes a one-time data migration step that converts existing string values to `TripPlatform` entries
- `UserSettings` is scoped to a single local user (no multi-user support in this version)
- Notification scheduling for reminders delegates to the existing `expo-notifications` integration; UI for notification permission prompts is out of scope for this feature
