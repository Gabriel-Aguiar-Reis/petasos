# Research: Backend Domain Refactor

**Feature**: `004-backend-domain-refactor`
**Date**: 2026-04-20
**Phase**: 0 — All NEEDS CLARIFICATION resolved

---

## R-001 — rrule.js: Expo SDK 55 / React Native 0.83 Compatibility

**Decision**: Use `rrule` ^2.8.1 (latest stable as of April 2026) only in the **application/infrastructure layer**.

**Rationale**: `rrule` is a pure-JS library with no native bindings; it works fine in the Metro bundler. The domain layer stores recurrence data as RFC 5545 strings (type alias `RecurrenceRule = string`). `rrule` is never imported inside `src/domain/`. This satisfies FR-011 and Constitution Principle IV.

**Alternatives considered**:

- `rrule-rust` (WASM) — overkill for mobile single-user; no Expo prebuild needed.
- Manual RRULE parser — high maintenance risk; rejected.

**Integration point**: A helper `src/application/services/recurrence.service.ts` wraps `rrulestr` + `RRuleSet` and exposes `getOccurrences(recurrence: Recurrence, after?: Date, before?: Date): Date[]`.

---

## R-002 — BrasilAPI Holiday Sync Strategy

**Decision**: Fetch `https://brasilapi.com.br/api/feriados/v1/{year}` via `fetch()` (built into React Native). Persist results as `SpecialDay` rows with `source: 'official'`. Cache flag stored in a `metadata` table (key/value) to skip re-sync within the same year. Sync is triggered from the React Query initialisation layer, not the domain.

**Rationale**: BrasilAPI is free, maintained, and used by thousands of Brazilian apps. The response schema `[{ date: "YYYY-MM-DD", name: string, type: "national" | "optional" }]` maps directly to `SpecialDay.type = 'holiday' | 'optional'`. Offline-first: sync failure logs a warning and the app continues with cached data (Constitution Principle I).

**Alternatives considered**:

- `google-calendar` API — requires OAuth, violates offline-first.
- Static seed file — cannot stay current; rejected.

**Retry policy**: On sync failure, retry up to 2 times with 2-second exponential back-off. After 2 failures, set `syncStatus = 'failed'` in metadata and surface a silent toast to the user. No crash.

---

## R-003 — Trip.platform Migration: string → TripPlatform FK

**Decision**: One-time Drizzle migration that:

1. Reads all distinct `platform` string values from the `trips` table.
2. Inserts a `TripPlatform` row for each unique value (deduplication by lowercased name).
3. Adds `platform_id` column (nullable initially) and back-fills it via the name lookup.
4. Drops `platform` column after back-fill.

**Rationale**: Clean FK relationship is required by FR-003 and enables FR-028 (per-platform profit goals). The migration runs inside a single SQLite transaction; on failure the old column remains intact (rollback-safe).

**Alternatives considered**:

- Keep `platform` string and add separate `TripPlatform` entity in parallel — would create a split model and break SC-007 tests. Rejected.

---

## R-004 — Drizzle Schema Strategy for Discriminated Unions (MaintenanceTrigger, Recurrence)

**Decision**: Store discriminated union fields as flat columns with a `type` discriminator column.

- `MaintenanceTrigger` → `trigger_type TEXT NOT NULL` (`'date'` | `'mileage'`), `trigger_date INTEGER` (timestamp, nullable), `trigger_mileage REAL` (nullable). Domain entity reconstructs the union on read.
- `Recurrence` → stored as three columns on the `costs` table: `recurrence_rule TEXT` (RFC 5545 string, nullable), `recurrence_end_date INTEGER` (nullable), `recurrence_exceptions TEXT` (JSON array of timestamps serialized as ISO strings, nullable).

**Rationale**: SQLite has no JSON column type (though JSON functions exist). Flat columns are simpler to index and query. Drizzle ORM does not natively support JSON discriminated unions; flat columns avoid a custom serializer.

**Alternatives considered**:

- Single JSON blob per union — harder to query and index, especially for date-range cost queries. Rejected.
- Separate junction tables — over-engineering for a single-user MVP. Rejected.

---

## R-005 — FuelLog → FuelConsumptionRecord Model Upgrade

**Decision**: The existing `FuelLog` entity (liters, totalPrice, odometer, fuelType string) is **replaced** by two separate entities:

- `FuelPriceRecord` — tracks price per liter per fuel type over time.
- `FuelConsumptionRecord` — full refuel event with `startMileage`, `endMileage`, `fuelAdded`, `averageConsumption`, `fuelTypeId` FK.

`FuelLog` is **deprecated** and its table migrated: existing rows are converted to `FuelConsumptionRecord` rows. `totalPrice` → `fuelAdded = totalPrice / (totalPrice / liters) = liters`, `pricePerLiter` back-calculated and seeded into `FuelPriceRecord` for that date.

**Rationale**: The new model separates concerns (price history vs. consumption event), supports the gauge adjustment (`fuelGaugeMeasurement`), and enables per-type price tracking for the trip offer evaluator (R-002). This was not possible with the old single-table design.

**Alternatives considered**:

- Add columns to `FuelLog` table — would create a god-table. Rejected for YAGNI and clarity.

---

## R-006 — UserSettings Table: Single-Row Pattern

**Decision**: `UserSettings` is stored as a single row with a well-known `id = 'default'`. The `GetUserSettings` use case reads this row; if absent, it returns a hardcoded default object without inserting it (lazy creation). `UpdateUserSettings` upserts by `id = 'default'`.

**Rationale**: Single-user MVP. No multi-tenant concern. A `userId` FK on the settings table is reserved for future use but will always equal the single user's ID in the current version.

---

## R-007 — PlannedAbsence: workedDays Serialization

**Decision**: `workedDays: Date[]` is stored as a JSON array of ISO 8601 date strings in a `worked_days TEXT` column. Drizzle `customType` or `.$type<Date[]>()` with a `mapTo`/`mapFrom` handles serialization at the infra layer.

**Rationale**: The number of worked days within a vacation period is expected to be small (< 30). JSON blob in a TEXT column is sufficient and avoids a junction table.

---

## R-008 — Goal Entity Evolution: SavedProfitGoal vs. existing Goal

**Decision**: The existing `Goal` entity (`type: GoalType`, `targetAmount`, `periodStart`) is **kept for backward compatibility** with the dashboard hook. `SavedProfitGoal` is a **new, separate entity** with a `name` and optional `period` (without `periodStart`). `PlatformProfitGoal` is also new. The old `Goal` will be aliased/deprecated in a future spec once the UI migrates.

**Rationale**: Changing `Goal` in place would break all existing tests (SC-007). The two models coexist in this release.

---

## R-009 — Domain Purity Enforcement (FR-031)

**Decision**: Add an ESLint rule via `eslint-plugin-boundaries` or a custom `no-restricted-imports` rule in the ESLint config that prevents `src/domain/**` from importing anything outside `src/domain/` except `src/lib/errors`.

**Rationale**: Static analysis catch is faster than PR review for this class of violation. The rule can be added to `.eslintrc.js` without a new dependency (`no-restricted-imports` is built-in).

**Pattern to block in domain files**:

```js
// .eslintrc.js addition
{
  files: ['src/domain/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: ['expo*', 'react-native*', 'drizzle-orm*', 'rrule*', '@/src/infra/*', '@/src/components/*']
    }]
  }
}
```
