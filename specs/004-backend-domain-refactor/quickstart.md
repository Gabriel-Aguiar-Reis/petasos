# Quickstart: Backend Domain Refactor

**Feature**: `004-backend-domain-refactor`
**Date**: 2026-04-20

---

## Prerequisites

- Node.js ≥ 20 (LTS)
- `npm install` already run (all 001–003 dependencies installed)
- Android emulator / device ready (Expo SDK 55)

---

## 1. Install new dependency

```bash
npm install rrule
```

> `rrule` is a pure-JS lib — no native build step required.

---

## 2. Generate Drizzle migration

After updating the schema files (see data-model.md for all new tables and column additions):

```bash
npx drizzle-kit generate
```

The migration will include:

- 13 new tables (`fuel_types`, `vehicle_types`, `trip_platforms`, `mileage_records`, `fuel_price_records`, `fuel_consumption_records`, `profits`, `reminders`, `maintenances`, `special_days`, `planned_absences`, `trip_offer_records`, `saved_profit_goals`, `platform_profit_goals`, `user_settings`)
- `vehicles` table: 7 new columns (`brand`, `model`, `year`, `fuel_type_id`, `type_id`, `color`, `notes`)
- `trips` table: add `platform_id` column + multi-step migration for `platform → platform_id` (see R-003 in research.md)
- `costs` table: 5 new columns (`description`, `recurrence_rule`, `recurrence_end_date`, `recurrence_exceptions`, `tags`)

> **Migration order matters**: `fuel_types`, `vehicle_types`, `trip_platforms` MUST be created before `vehicles`, `trips`, and `profits` that reference them.

---

## 3. Run all tests

```bash
npx jest tests/
```

After implementation, expected output:

```
PASS tests/fuel-type.test.ts
PASS tests/vehicle-type.test.ts
PASS tests/trip-platform.test.ts
PASS tests/vehicle.test.ts          (updated — new fields)
PASS tests/trip.test.ts             (updated — platformId migration)
PASS tests/cost.test.ts             (updated — recurrence/tags)
PASS tests/fuel-consumption.test.ts
PASS tests/mileage-record.test.ts
PASS tests/fuel-price-record.test.ts
PASS tests/profit.test.ts
PASS tests/work-session.test.ts     (updated — update use case)
PASS tests/reminder.test.ts
PASS tests/maintenance.test.ts
PASS tests/special-day.test.ts
PASS tests/planned-absence.test.ts
PASS tests/trip-offer-record.test.ts
PASS tests/saved-profit-goal.test.ts
PASS tests/platform-profit-goal.test.ts
PASS tests/user-settings.test.ts
PASS tests/domain-functions.test.ts  (calculateProfit, calculateAverageConsumption, calculateFuelLiters, evaluateTripOfferPill, createTripFromOffer)

# All pre-existing 001 tests must still pass
PASS tests/dashboard.test.ts
PASS tests/export.test.ts
PASS tests/hooks.test.ts
```

---

## 4. Type-check

```bash
npx tsc --noEmit
```

Zero errors expected. The domain purity ESLint rule (FR-031) runs via:

```bash
npx eslint src/domain/
```

Expected: 0 errors, 0 warnings.

---

## 5. Start dev server

```bash
npx expo start --android
```

---

## Key Files Added / Changed

| Path                                                  | Status                                                 |
| ----------------------------------------------------- | ------------------------------------------------------ |
| `src/domain/entities/recurrence.ts`                   | NEW                                                    |
| `src/domain/entities/fuel-type.ts`                    | NEW                                                    |
| `src/domain/entities/vehicle-type.ts`                 | NEW                                                    |
| `src/domain/entities/trip-platform.ts`                | NEW                                                    |
| `src/domain/entities/vehicle.ts`                      | UPDATED                                                |
| `src/domain/entities/trip.ts`                         | UPDATED (`platformId`)                                 |
| `src/domain/entities/cost.ts`                         | UPDATED (`recurrence`, `tags`, `description`)          |
| `src/domain/entities/fuel-price-record.ts`            | NEW                                                    |
| `src/domain/entities/fuel-consumption-record.ts`      | NEW (replaces `fuel-log.ts` for new records)           |
| `src/domain/entities/mileage-record.ts`               | NEW                                                    |
| `src/domain/entities/profit.ts`                       | NEW                                                    |
| `src/domain/entities/reminder.ts`                     | NEW                                                    |
| `src/domain/entities/maintenance.ts`                  | NEW                                                    |
| `src/domain/entities/special-day.ts`                  | NEW                                                    |
| `src/domain/entities/planned-absence.ts`              | NEW                                                    |
| `src/domain/entities/trip-offer-record.ts`            | NEW (+ `evaluateTripOfferPill`, `createTripFromOffer`) |
| `src/domain/entities/saved-profit-goal.ts`            | NEW                                                    |
| `src/domain/entities/platform-profit-goal.ts`         | NEW                                                    |
| `src/domain/entities/user-settings.ts`                | NEW                                                    |
| `src/domain/entities/profit-calculator.ts`            | NEW (`calculateProfit`, `calculateFuelLiters`)         |
| `src/domain/repositories/`                            | 16 new interface files                                 |
| `src/domain/validations/`                             | 16 new schema files                                    |
| `src/application/use-cases/`                          | ~40 new use case files                                 |
| `src/application/services/recurrence.service.ts`      | NEW                                                    |
| `src/application/services/holiday-sync.service.ts`    | NEW                                                    |
| `src/application/services/trip-offer-eval.service.ts` | NEW                                                    |
| `src/infra/db/schema/`                                | 15 new schema files; 3 updated                         |
| `src/infra/repositories/`                             | 16 new Drizzle repository implementations              |
| `tests/`                                              | ~20 new test files                                     |

---

## Notes for Implementers

1. **Domain purity first**: Implement all domain entities and pure functions before writing use cases or repositories. This enables test-driven development with in-memory stubs.

2. **Migration sequencing**: The `trips` platform migration (R-003) must run as a single SQLite transaction. Use `db.transaction()` in Drizzle to ensure rollback safety.

3. **Recurrence expansion**: Never call `rrule.js` inside `src/domain/`. Only `RecurrenceService` (in `src/application/services/`) touches the library. Use cases that need occurrence lists call `recurrenceService.getOccurrences()`.

4. **FuelLog backward compatibility**: Keep the `FuelLog` class and its Drizzle schema intact. The migration creates the new tables alongside it. Existing UI code that reads `FuelLog` continues to work until the UI spec migrates screens to the new model.

5. **Holiday sync**: `SyncOfficialHolidays` should be called from the app initialization hook (TanStack Query `onMount`), not from a domain use case. Network failures must be caught and suppressed — no `StorageError` propagated to the UI for sync failures.
