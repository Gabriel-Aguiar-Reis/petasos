# Tasks: Frontend UI Screens — RoadLedger Mobile App

**Input**: Design documents from `/specs/002-frontend-ui-screens/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.
Tests are NOT included (not requested in the specification).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US7)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure build tools, and establish the NativeWind + theming foundation that all screens depend on.

- [x] T001 Install new npm dependencies: `nativewind@4.2.3`, `tailwindcss@3`, `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.5.0`, `lucide-react-native@1.8.0`, `@rn-primitives/slot@1.4.0`, `@rn-primitives/progress@1.4.0`, `@rn-primitives/tabs@1.4.0`, `@rn-primitives/select@1.4.0`, `expo-file-system@55.0.16`, `expo-sharing@55.0.18`
- [x] T002 Create `tailwind.config.js` at repo root with NativeWind preset, dark mode `class` strategy, and CSS variable color tokens per `specs/002-frontend-ui-screens/quickstart.md`
- [x] T003 Create `global.css` at repo root with Tailwind directives and CSS custom property values for light and dark themes
- [x] T004 Update `babel.config.js` to add `nativewind/babel` plugin and set `jsxImportSource: 'nativewind'`
- [x] T005 Create `metro.config.js` at repo root wrapping the default Expo config with `withNativeWind()` pointing to `global.css`
- [x] T006 [P] Create `src/lib/utils.ts` with `cn()` helper (`clsx` + `tailwind-merge`)
- [x] T007 [P] Create `src/lib/format.ts` with `formatCurrency(value: number): string` (BRL, pt-BR) and `formatDuration(minutes: number): string`

**Checkpoint**: `npx expo start -c --android` renders a screen with NativeWind `className` classes applied correctly

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared UI primitives, Zustand stores, and root layout that EVERY screen depends on. No user story can be implemented until this phase is complete.

- [x] T008 Create `src/components/ui/text.tsx` — base `Text` primitive with NativeWind `className` forwarding (copy/adapt from react-native-reusables registry)
- [x] T009 [P] Create `src/components/ui/button.tsx` — `Button` component with `cva` variants (`default`, `destructive`, `outline`, `ghost`), min tap target 44 dp
- [x] T010 [P] Create `src/components/ui/input.tsx` — controlled `TextInput` wrapper with `className`, error state, and label slot
- [x] T011 [P] Create `src/components/ui/card.tsx` — `Card`, `CardHeader`, `CardContent`, `CardFooter` composables
- [x] T012 [P] Create `src/components/ui/badge.tsx` — `Badge` component with `default` and `secondary` variants
- [x] T013 [P] Create `src/components/ui/separator.tsx` — horizontal/vertical divider
- [x] T014 [P] Create `src/components/ui/progress.tsx` — wraps `@rn-primitives/progress` with NativeWind styling, accepts `value: number` (0–100)
- [x] T015 [P] Create `src/lib/stores/quick-entry.store.ts` — Zustand store: `isOpen`, `entryType`, `openTrip()`, `openCost()`, `close()`
- [x] T016 [P] Create `src/lib/stores/active-session.store.ts` — Zustand store: `activeSessionId`, `startedAt`, `startSession()`, `endSession()`
- [x] T017 Create `src/components/empty-state.tsx` — `EmptyState` component with `title`, `description`, and optional `action` (Button) props
- [x] T018 Update `app/_layout.tsx` — wrap stack with `QueryClientProvider` (new `QueryClient` instance); keep existing `initializeDatabase()` call; add `import '../global.css'`
- [x] T019 Create `app/(tabs)/_layout.tsx` — Expo Router `<Tabs>` navigator with 5 tabs: Dashboard (`LayoutDashboard`), Trips (`Car`), Costs (`Receipt`), Fuel (`Fuel`), More (`Menu`); lucide-react-native icons at size 20

**Checkpoint**: App launches with bottom tab bar; switching tabs works; NativeWind dark theme applies globally

---

## Phase 3: User Story 1 — Dashboard (Priority: P1) 🎯 MVP

**Goal**: Driver opens the app and sees total earnings, total costs, net profit, and per-platform breakdown for a selected period (today / this week / this month).

**Independent Test**: Seed trips and costs in the SQLite DB → open Dashboard → verify correct totals and platform rows appear; switch period → verify metrics update; empty state shows when no data for period.

- [x] T020 [US1] Create `src/application/hooks/use-dashboard-summary.ts` — `useDashboardSummary(dateRange: DateRangeFilter)` using `useQuery`, key `['dashboard', dateRange]`, instantiates `GetDashboardSummary` with Drizzle repositories from `src/infra/db/client.ts`
- [x] T021 [P] [US1] Create `src/components/dashboard-metric-card.tsx` — props: `label: string, value: string, sub?: string`; displays one KPI block (earnings / costs / profit)
- [x] T022 [P] [US1] Create `src/components/platform-earnings-row.tsx` — props: `platform: string, earnings: number`; renders platform name and `formatCurrency(earnings)`
- [x] T023 [P] [US1] Create `src/components/period-selector.tsx` — props: `value: 'today' | 'week' | 'month', onChange`; wraps `@rn-primitives/tabs` with three options
- [x] T024 [US1] Create `app/(tabs)/index.tsx` — Dashboard screen: uses `useDashboardSummary`, `PeriodSelector`, `DashboardMetricCard` × 3 (earnings, costs, profit), `PlatformEarningsRow` list, `EmptyState` when no data; `QuickEntryFAB` placed in screen layout

**Checkpoint**: Dashboard screen renders correct metrics; period switching updates values; empty state shown for empty DB

---

## Phase 4: User Story 2 — Trip Quick-Entry & List (Priority: P1)

**Goal**: Driver registers a trip in ≤ 3 taps via FAB overlay (earnings + platform required), or via a full form with all optional fields. Trips list shows all entries sorted by date descending.

**Independent Test**: Tap FAB → enter earnings + platform → save → trip appears in Trips screen list and Dashboard totals update.

- [x] T025 [US2] Create `src/application/hooks/use-trips.ts` — `useTrips(filter?)` (`useQuery`, key `['trips', filter]`, `GetTripsByFilter`), `useCreateTrip()` (mutation, invalidates `['trips', *]` and `['dashboard', *]`), `useUpdateTrip()`, `useDeleteTrip()`
- [x] T026 [P] [US2] Create `src/components/trip-card.tsx` — props: `trip: Trip, onEdit: () => void, onDelete: () => void`; shows date, platform (`Badge`), earnings (`formatCurrency`), distance (if not null); edit/delete accessible via `Pressable` long-press revealing action buttons
- [x] T027 [US2] Create `src/components/trip-form.tsx` — controlled form: earnings (required, numeric `Input`), platform (required, text `Input`), date (defaults to today), origin, destination, distance, duration (all optional); calls `useCreateTrip` or `useUpdateTrip` on submit; shows inline validation errors; props: `trip?: Trip, onClose: () => void`
- [x] T028 [US2] Create `src/components/quick-entry-fab.tsx` — `QuickEntryFAB` renders a floating `Button` (`Plus` icon, 56 dp, position absolute bottom-right); on press calls `useQuickEntryStore.openTrip()`; renders on Dashboard, Trips, and Costs screens
- [x] T029 [US2] Create `src/components/quick-entry-overlay.tsx` — `QuickEntryOverlay` reads `useQuickEntryStore`; renders a bottom-sheet Modal with a collapsed quick-entry form (2 required fields) and an "expand" affordance revealing full form; calls `useCreateTrip` or `useCreateCost` based on `entryType`; calls `store.close()` on success or dismiss
- [x] T030 [US2] Create `app/(tabs)/trips.tsx` — Trips screen: `FlatList` of `TripCard` from `useTrips()`; `EmptyState` when list is empty; edit sheet opens `TripForm` with existing trip; `QuickEntryFAB` in layout

**Checkpoint**: FAB opens overlay; 2-field save creates trip; full form save creates trip with all fields; edit and delete work; Dashboard totals update after each mutation

---

## Phase 5: User Story 3 — Cost Entry & List (Priority: P1)

**Goal**: Driver logs an operational cost (amount + category required); list sorted by date descending; edit and delete supported; Dashboard total costs updates immediately.

**Independent Test**: Open Costs screen → New Cost → enter amount + category → save → cost appears in list; Dashboard total costs increases; edit cost → amount changes in list and Dashboard.

- [x] T031 [US3] Create `src/application/hooks/use-costs.ts` — `useCosts(filter?)` (`useQuery`, key `['costs', filter]`), `useCreateCost()`, `useUpdateCost()`, `useDeleteCost()` (all mutations invalidate `['costs', *]` and `['dashboard', *]`)
- [x] T032 [P] [US3] Create `src/components/cost-card.tsx` — props: `cost: Cost, onEdit: () => void, onDelete: () => void`; shows date, category label, `formatCurrency(amount)`; edit/delete via long-press
- [x] T033 [US3] Create `src/components/cost-form.tsx` — controlled form: amount (required, numeric `Input`), category (required, `@rn-primitives/select` with options: fuel / maintenance / food / parking_tolls / custom), custom label `Input` revealed when category = "custom", date (defaults to today); props: `cost?: Cost, onClose: () => void`; inline validation errors
- [x] T034 [US3] Create `app/(tabs)/costs.tsx` — Costs screen: `FlatList` of `CostCard` from `useCosts()`; `EmptyState` when empty; edit sheet opens `CostForm` with existing cost; `QuickEntryFAB` in layout; update `QuickEntryOverlay` so that when `entryType = 'cost'` it renders the cost quick-entry fields

**Checkpoint**: Cost quick-entry (2 fields) works from FAB on any P1 tab; full cost form works; edit and delete work; Dashboard total costs is consistent

---

## Phase 6: User Story 4 — Fuel Tracking (Priority: P2)

**Goal**: Driver logs a fuel fill-up (fuel type, liters, total price, odometer required). Fuel screen shows history and, for each fuel type with ≥ 2 logs, displays km/L and cost-per-km.

**Independent Test**: Add one fill-up → "not enough data" message shown; add second fill-up of same type → km/L and cost-per-km values appear correctly.

- [x] T035 [US4] Create `src/application/hooks/use-fuel-logs.ts` — `useFuelLogs()` (`useQuery`, key `['fuel-logs']`), `useCreateFuelLog()` (mutation, invalidates `['fuel-logs']` and `['fuel-efficiency', *]`), `useDeleteFuelLog()`, `useFuelEfficiency(fuelType: string)` (`useQuery`, key `['fuel-efficiency', fuelType]`, uses `GetFuelEfficiency` use case)
- [x] T036 [P] [US4] Create `src/components/fuel-log-card.tsx` — props: `log: FuelLog, onDelete: () => void`; shows date, fuel type (`Badge`), liters, `formatCurrency(totalPrice)`, derived price-per-liter; delete via long-press
- [x] T037 [US4] Create `src/components/fuel-form.tsx` — controlled form: fuel type (`@rn-primitives/select` with standard options: Gasolina / Etanol / Diesel / GNV plus free-form), liters (numeric), total price (numeric), odometer (numeric, all required); inline validation (odometer must be > previous for same type); props: `onClose: () => void`
- [x] T038 [US4] Create `app/(tabs)/fuel.tsx` — Fuel screen: efficiency summary cards per fuel type (km/L, cost-per-km) using `useFuelEfficiency`; "not enough data" message when < 2 logs of that type; `FlatList` of `FuelLogCard` from `useFuelLogs()`; `EmptyState` when no logs; FAB-like `Button` ("Add Fill-Up") opens `FuelForm` in Modal

**Checkpoint**: Two fill-ups of same type → km/L and cost-per-km displayed; one fill-up → "not enough data"; odometer validation prevents invalid entry

---

## Phase 7: User Story 5 — Work Sessions (Priority: P2)

**Goal**: Driver clocks in / clocks out; running timer persists across navigation; completed sessions listed with date, start, end, duration; delete supported.

**Independent Test**: Clock In → navigate away → return → timer still running with correct elapsed time; Clock Out → session appears in list with correct duration.

- [x] T039 [US5] Create `src/application/hooks/use-work-sessions.ts` — `useWorkSessions()` (`useQuery`, key `['work-sessions']`), `useStartWorkSession()` (mutation → `StartWorkSession` use case → calls `store.startSession()`; invalidates `['work-sessions']`), `useEndWorkSession()` (mutation → `EndWorkSession` → calls `store.endSession()`; invalidates `['work-sessions']`), `useDeleteWorkSession()` (mutation; invalidates `['work-sessions']`)
- [x] T040 [P] [US5] Create `src/components/active-session-timer.tsx` — props: `startedAt: number` (Unix ms); displays elapsed HH:MM:SS using `setInterval` (1 s); cleans up interval on unmount
- [x] T041 [P] [US5] Create `src/components/work-session-card.tsx` — props: `session: WorkSession, onDelete: () => void`; shows date, start time, end time, duration (`formatDuration`); delete via long-press
- [x] T042 [US5] Create `app/work-sessions.tsx` — Work Sessions screen: reads `useActiveSessionStore`; if `activeSessionId` is set → show `ActiveSessionTimer` and "Clock Out" `Button`; else show "Clock In" `Button`; `FlatList` of `WorkSessionCard` from `useWorkSessions()`; `EmptyState` when no sessions; on app resume re-hydrates active session from repository (query for session with `endTime = null` on mount)

**Checkpoint**: Clock In starts timer; navigate to other tabs and back — timer continues; Clock Out saves session and resets timer; session appears in history with correct duration

---

## Phase 8: User Story 6 — Goals (Priority: P2)

**Goal**: Driver sets daily/weekly/monthly earnings goals; each goal shows a progress bar, amount achieved, and amount remaining; goals are deletable.

**Independent Test**: Create daily goal of R$ 200 → record trip of R$ 80 → Goal card shows 40% progress bar, "R$ 80,00 achieved", "R$ 120,00 remaining".

- [x] T043 [US6] Create `src/application/hooks/use-goals.ts` — `useGoals()` (`useQuery`, key `['goals']`), `useCreateGoal()` (mutation; invalidates `['goals']`), `useDeleteGoal()` (mutation; invalidates `['goals']`), `useGoalProgress(goalId: string, dateRange: DateRangeFilter)` (`useQuery`, key `['goal-progress', goalId, dateRange]`, uses `GetGoalProgress` use case)
- [x] T044 [US6] Create `src/components/goal-card.tsx` — props: `goal: Goal`; internally calls `useGoalProgress(goal.id, derivedDateRange)` (derives date range from `goal.type` + `goal.periodStart`); renders `Progress` bar (0–100), achieved amount, remaining amount, 100% completion indicator when progress ≥ target; delete via long-press
- [x] T045 [US6] Create `src/components/goal-form.tsx` — controlled form: type (`@rn-primitives/select`: daily / weekly / monthly), target amount (numeric `Input`, required), period start date (defaults to today); props: `onClose: () => void`; calls `useCreateGoal` on submit
- [x] T046 [US6] Create `app/goals.tsx` — Goals screen: `FlatList` of `GoalCard` from `useGoals()`; `EmptyState` when no goals; `Button` ("New Goal") opens `GoalForm` in Modal; delete confirmation via `Alert.alert`

**Checkpoint**: New goal → progress bar at 0%; record trip within goal period → progress bar updates on next screen visit; goal at 100% shows completion indicator; delete removes goal

---

## Phase 9: User Story 7 — JSON Export (Priority: P3)

**Goal**: Driver taps "Export JSON" (optionally with date range filter) → native share sheet opens with a valid `.json` file containing all entity types.

**Independent Test**: Tap Export JSON → share sheet opens; save file; verify JSON contains `trips`, `costs`, `fuelLogs`, `workSessions`, `goals`, `exportedAt`, `filters` keys.

- [x] T047 [US7] Create `src/application/hooks/use-export.ts` — `useExportData()` (`useMutation`): calls `ExportDataAsJSON` use case → serialises result to JSON string → `FileSystem.writeAsStringAsync(cacheDir + filename)` → `Sharing.shareAsync(fileUri, { mimeType: 'application/json' })`
- [x] T048 [US7] Create `app/export.tsx` — Export screen: local `useState` for optional date range filter (from/to date pickers or text inputs); "Export JSON" `Button` calls `useExportData` mutation with filter; shows loading state on `Button` while mutation is pending; shows error `Text` on failure

**Checkpoint**: Export JSON button produces a valid shareable JSON file; date range filter limits records in the output; error state shown on failure

---

## Phase 10: More Hub & Navigation Polish

**Purpose**: Wire the "More" tab hub screen, link sub-screens, and apply cross-cutting polish (loading states, error boundaries, screen headers, tap target audit).

- [x] T049 Create `app/(tabs)/more.tsx` — More hub screen: list of `Pressable` rows with `ChevronRight` icon for: "Sessões de Trabalho" → `router.push('/work-sessions')`, "Metas" → `router.push('/goals')`, "Exportar Dados" → `router.push('/export')`; each row min 44 dp height
- [x] T050 [P] Audit all `Pressable`, `TouchableOpacity`, and `Button` components for minimum 44×44 dp tap target (SC-006); fix any violations
- [x] T051 [P] Add `screenOptions` to `app/(tabs)/_layout.tsx` and stack screens: Portuguese titles, consistent header style using NativeWind theme colors
- [x] T052 Add loading skeleton or `ActivityIndicator` placeholders to Dashboard, Trips, Costs, and Fuel screens for the initial data fetch (`isLoading` state from `useQuery`)
- [x] T053 Add error message display (`Text` with destructive color) to all screens for `isError` state from `useQuery` and `useMutation`

**Checkpoint**: Full app flow works end-to-end; all screens accessible via tabs or More hub; no missing headers; loading and error states visible

---

## Dependencies (User Story Completion Order)

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1: Dashboard)
                                        → Phase 4 (US2: Trips) [parallel with US1]
                                        → Phase 5 (US3: Costs) [parallel with US1, US2]
                                        → Phase 6 (US4: Fuel)  [parallel with US1–US3]
                                        → Phase 7 (US5: Work Sessions) [parallel]
                                        → Phase 8 (US6: Goals) [parallel]
                                        → Phase 9 (US7: Export) [parallel]
Phase 3–9 complete → Phase 10 (Polish)
```

US1, US2, and US3 share the `QuickEntryOverlay` component (T029) — US2 builds it, US3 extends it for cost entry.

## Parallel Execution Examples

**After Phase 2 is complete**, the following groups can run in parallel:

- **Group A** (US1): T020–T024
- **Group B** (US2): T025–T030 — T029 must complete before T034 (US3) starts
- **Group C** (US3): T031–T034 — can start after T029 is done
- **Group D** (US4): T035–T038
- **Group E** (US5): T039–T042
- **Group F** (US6): T043–T046
- **Group G** (US7): T047–T048

Within each group, tasks marked `[P]` (component/hook tasks for different files) can be parallelised.

## Implementation Strategy

**MVP scope (deliver first)**: Phase 1 + Phase 2 + Phase 3 (Dashboard) — this proves NativeWind is wired, the React Query layer works, and a driver can see their financial summary.

**Next increment**: Add Phase 4 (Trips) + Phase 5 (Costs) — this enables data entry, making the dashboard reflect real data.

**Final MVP**: Phase 6–9 + Phase 10 — completes all 7 user stories and applies polish.

## Summary

| Metric                      | Count                 |
| --------------------------- | --------------------- |
| Total tasks                 | 53                    |
| Phase 1 (Setup)             | 7                     |
| Phase 2 (Foundation)        | 12                    |
| Phase 3 — US1 Dashboard     | 5                     |
| Phase 4 — US2 Trips         | 6                     |
| Phase 5 — US3 Costs         | 4                     |
| Phase 6 — US4 Fuel          | 4                     |
| Phase 7 — US5 Work Sessions | 4                     |
| Phase 8 — US6 Goals         | 4                     |
| Phase 9 — US7 Export        | 2                     |
| Phase 10 — Polish           | 5                     |
| Parallelizable tasks [P]    | 26                    |
| Suggested MVP scope         | Phases 1–3 (19 tasks) |
