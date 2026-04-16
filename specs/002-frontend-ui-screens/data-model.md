# Data Model: Frontend UI Screens

**Feature**: `002-frontend-ui-screens`
**Date**: 2026-04-16
**Source**: spec.md FR-001–FR-024 + research.md R-003–R-005

---

## Navigation Model

### Route Tree (Expo Router)

```
app/
├── _layout.tsx              # Root: DB init, QueryClientProvider, ThemeProvider
├── (tabs)/
│   ├── _layout.tsx          # <Tabs> bottom navigator — 5 tabs
│   ├── index.tsx            # Tab: Dashboard
│   ├── trips.tsx            # Tab: Trips
│   ├── costs.tsx            # Tab: Costs
│   ├── fuel.tsx             # Tab: Fuel
│   └── more.tsx             # Tab: More (hub screen)
├── work-sessions.tsx        # Stack: Work Sessions (from More)
├── goals.tsx                # Stack: Goals (from More)
└── export.tsx               # Stack: Export (from More)
```

### Tab Definitions

| Tab Index | Name      | Route           | Icon              |
| --------- | --------- | --------------- | ----------------- |
| 0         | Dashboard | `/(tabs)/`      | `LayoutDashboard` |
| 1         | Trips     | `/(tabs)/trips` | `Car`             |
| 2         | Costs     | `/(tabs)/costs` | `Receipt`         |
| 3         | Fuel      | `/(tabs)/fuel`  | `Fuel`            |
| 4         | More      | `/(tabs)/more`  | `Menu`            |

---

## Zustand Stores

### QuickEntryStore

```typescript
// src/lib/stores/quick-entry.store.ts
type QuickEntryType = 'trip' | 'cost'

type QuickEntryState = {
  isOpen: boolean
  entryType: QuickEntryType
  openTrip: () => void
  openCost: () => void
  close: () => void
}
```

### ActiveSessionStore

```typescript
// src/lib/stores/active-session.store.ts
type ActiveSessionState = {
  activeSessionId: string | null
  startedAt: number | null // Unix ms
  startSession: (id: string, startedAt: number) => void
  endSession: () => void
}
```

---

## React Query Hooks

All hooks live in `src/application/hooks/`. Each hook instantiates its use case with a Drizzle repository singleton from `src/infra/db/client.ts`.

### `useDashboardSummary(dateRange: DateRangeFilter)`

```typescript
// Query key: ['dashboard', dateRange]
// Returns: UseQueryResult<DashboardSummary>
// Use case: GetDashboardSummary
// Invalidated by: useCreateTrip, useUpdateTrip, useDeleteTrip,
//                 useCreateCost, useUpdateCost, useDeleteCost
```

### `useTrips(filter?: TripFilter)`

```typescript
// Query key: ['trips', filter]
// Returns: UseQueryResult<Trip[]>
// Use case: GetTripsByFilter
```

### `useCreateTrip()`

```typescript
// Returns: UseMutationResult<Trip, Error, CreateTripInput>
// Use case: CreateTrip
// On success: invalidates ['trips', *], ['dashboard', *]
```

### `useUpdateTrip()`

```typescript
// Returns: UseMutationResult<Trip, Error, UpdateTripInput & { id: string }>
// Use case: UpdateTrip
// On success: invalidates ['trips', *], ['dashboard', *]
```

### `useDeleteTrip()`

```typescript
// Returns: UseMutationResult<void, Error, string>  // id
// Use case: DeleteTrip
// On success: invalidates ['trips', *], ['dashboard', *]
```

### `useCosts(filter?: CostFilter)`

```typescript
// Query key: ['costs', filter]
// Returns: UseQueryResult<Cost[]>
// Use case: GetCostsByFilter
```

### `useCreateCost()` / `useUpdateCost()` / `useDeleteCost()`

```typescript
// Same pattern as Trip mutations
// On success: invalidates ['costs', *], ['dashboard', *]
```

### `useFuelLogs(filter?: FuelFilter)`

```typescript
// Query key: ['fuel-logs', filter]
// Returns: UseQueryResult<FuelLog[]>
// Use case: (repository findAll)
```

### `useCreateFuelLog()` / `useDeleteFuelLog()`

```typescript
// On success: invalidates ['fuel-logs', *], ['fuel-efficiency', *]
```

### `useFuelEfficiency(fuelType: string)`

```typescript
// Query key: ['fuel-efficiency', fuelType]
// Returns: UseQueryResult<FuelEfficiencyResult | null>
// Use case: GetFuelEfficiency
```

### `useWorkSessions()`

```typescript
// Query key: ['work-sessions']
// Returns: UseQueryResult<WorkSession[]>
```

### `useStartWorkSession()` / `useEndWorkSession()` / `useDeleteWorkSession()`

```typescript
// useStartWorkSession: UseMutationResult<WorkSession, Error, void>
//   Use case: StartWorkSession
//   On success: invalidates ['work-sessions'], calls store.startSession()
// useEndWorkSession: UseMutationResult<WorkSession, Error, string>  // sessionId
//   Use case: EndWorkSession
//   On success: invalidates ['work-sessions'], calls store.endSession()
```

### `useGoals()`

```typescript
// Query key: ['goals']
// Returns: UseQueryResult<Goal[]>
```

### `useCreateGoal()` / `useDeleteGoal()`

```typescript
// On success: invalidates ['goals']
```

### `useGoalProgress(goalId: string, dateRange: DateRangeFilter)`

```typescript
// Query key: ['goal-progress', goalId, dateRange]
// Returns: UseQueryResult<GoalProgress>
// Use case: GetGoalProgress
```

### `useExportData()`

```typescript
// Returns: UseMutationResult<void, Error, ExportFilter | undefined>
// On mutate: calls ExportDataAsJSON use case → writes JSON file → opens share sheet
// No query invalidation needed
```

---

## Screen Component Props

### Dashboard Screen

```typescript
// No props — reads from useDashboardSummary + period state (local useState)
// Local state: selectedPeriod: 'today' | 'week' | 'month'
```

### Trips Screen

```typescript
// No props — reads from useTrips
// Local state: showForm: boolean, editingTrip: Trip | null
```

### Costs Screen

```typescript
// No props — reads from useCosts
// Local state: showForm: boolean, editingCost: Cost | null
```

### Fuel Screen

```typescript
// No props — reads from useFuelLogs + useFuelEfficiency per fuelType
```

### Work Sessions Screen

```typescript
// No props — reads from useWorkSessions + useActiveSessionStore
// Derived: elapsedSeconds = Date.now() - startedAt (updates via setInterval)
```

### Goals Screen

```typescript
// No props — reads from useGoals; each GoalCard reads useGoalProgress
```

### Export Screen

```typescript
// No props — local state: dateRange filter, calls useExportData mutation
```

---

## UI Component Inventory

### Shared Components (`src/components/ui/`)

Components copied from react-native-reusables registry or built from `@rn-primitives/*`:

| Component   | Source                    | Used By                              |
| ----------- | ------------------------- | ------------------------------------ |
| `Button`    | rnr registry              | All screens                          |
| `Text`      | rnr registry              | All screens                          |
| `Input`     | rnr registry              | All forms                            |
| `Card`      | rnr registry              | All list items                       |
| `Progress`  | `@rn-primitives/progress` | GoalCard                             |
| `Select`    | `@rn-primitives/select`   | Forms (category, fuelType, platform) |
| `Tabs`      | `@rn-primitives/tabs`     | Dashboard period picker              |
| `Separator` | rnr registry              | Lists                                |
| `Badge`     | rnr registry              | Platform labels                      |

### Icons (`lucide-react-native@1.8.0`)

All icons use `lucide-react-native` — individual tree-shakeable SVG components backed by `react-native-svg` (bundled with Expo SDK 55).

| Icon              | Used In                      |
| ----------------- | ---------------------------- |
| `LayoutDashboard` | Dashboard tab                |
| `Car`             | Trips tab                    |
| `Receipt`         | Costs tab                    |
| `Fuel`            | Fuel tab                     |
| `Menu`            | More tab                     |
| `Plus`            | FAB button                   |
| `Clock`           | Work Sessions screen / timer |
| `Target`          | Goals screen                 |
| `Share2`          | Export screen                |
| `Pencil`          | Edit actions on list items   |
| `Trash2`          | Delete actions on list items |
| `ChevronRight`    | More hub list rows           |
| `TrendingUp`      | Dashboard net profit metric  |
| `Droplets`        | Fuel log list items          |

Default size: `24` for content icons, `20` for tab bar icons. Color driven via `color` prop — value sourced from NativeWind `useColorScheme()` or the tab navigator's `tabBarActiveTintColor`.

### Feature Components (`src/components/`)

| Component             | Props                              | Description                                        |
| --------------------- | ---------------------------------- | -------------------------------------------------- |
| `QuickEntryFAB`       | `—`                                | Floating action button, reads `useQuickEntryStore` |
| `QuickEntryOverlay`   | `—`                                | Bottom sheet, reads `useQuickEntryStore`           |
| `TripForm`            | `trip?: Trip, onClose: () => void` | Create/edit trip form                              |
| `CostForm`            | `cost?: Cost, onClose: () => void` | Create/edit cost form                              |
| `TripCard`            | `trip: Trip, onEdit, onDelete`     | Trip list item                                     |
| `CostCard`            | `cost: Cost, onEdit, onDelete`     | Cost list item                                     |
| `FuelLogCard`         | `log: FuelLog, onDelete`           | Fuel list item                                     |
| `WorkSessionCard`     | `session: WorkSession, onDelete`   | Session list item                                  |
| `GoalCard`            | `goal: Goal`                       | Goal with progress bar                             |
| `DashboardMetricCard` | `label, value, sub?`               | Single metric display                              |
| `PlatformEarningsRow` | `platform, earnings`               | Per-platform row                                   |
| `EmptyState`          | `title, description, action?`      | Empty list placeholder                             |
| `PeriodSelector`      | `value, onChange`                  | Today / Week / Month tabs                          |
| `ActiveSessionTimer`  | `startedAt: number`                | Live elapsed time display                          |

---

## File Format: JSON Export

Structure produced by `ExportDataAsJSON` use case (defined in `001-app-backend`):

```typescript
type ExportEnvelope = {
  exportedAt: string // ISO 8601
  filters: ExportFilter // { dateRange?, platform? }
  trips: Trip[]
  costs: Cost[]
  fuelLogs: FuelLog[]
  workSessions: WorkSession[]
  goals: Goal[]
}
```

Written to: `${FileSystem.cacheDirectory}roadledger-export-{timestamp}.json`
Shared via: `Sharing.shareAsync(fileUri, { mimeType: 'application/json' })`

---

## Theme Tokens (tailwind.config.js)

Colors follow the react-native-reusables CSS variable convention, namespaced under `--background`, `--foreground`, `--primary`, `--muted`, etc. Dark mode is applied via NativeWind's `dark:` variant strategy.

```typescript
// tailwind.config.js (extend)
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
  border: 'hsl(var(--border))',
  ring: 'hsl(var(--ring))',
}
```
