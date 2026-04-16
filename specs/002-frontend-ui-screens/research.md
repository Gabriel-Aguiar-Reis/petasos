# Research: Frontend UI Screens — RoadLedger Mobile App

**Feature**: `002-frontend-ui-screens`
**Date**: 2026-04-16
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## R-001: React Native Reusables — Installation Model

**Decision**: React Native Reusables is a **copy-paste component library** (like shadcn/ui for web), not an npm package. Components are added individually to `src/components/ui/` via their CLI (`npx react-native-reusables@latest add <component>`) or by manually copying source files from the registry. The runtime primitives are published as scoped packages under `@rn-primitives/*` on npm.

**Rationale**: This mirrors the shadcn/ui model — developers own the component source code, can customise freely, and do not take a version-lock on a monolithic UI package. It aligns with Constitution Principle VII (Simplicity) because only the components actually used are added to the project.

**Key packages** (all available on npm):

- `@rn-primitives/slot@1.4.0` — base slot/polymorphic primitive
- `@rn-primitives/progress@1.4.0` — accessible progress bar
- `@rn-primitives/tabs@1.4.0` — tab group primitive
- `@rn-primitives/select@1.4.0` — select/picker primitive
- `@rn-primitives/accordion@1.4.0` — accordion primitive (optional)

**Alternatives considered**: Tamagui — rejected (heavier runtime, more complex setup). React Native Paper — rejected (not Tailwind-based, harder to customise). Building components from scratch — rejected (high cost for MVP timeline).

---

## R-002: NativeWind v4 Integration with Expo SDK 55

**Decision**: `nativewind@4.2.3` with `tailwindcss@3.x` (peer dep). NativeWind v4 uses the Babel/Metro transform approach for Expo managed workflow. Configuration requires:

1. `babel.config.js` — add `nativewind/babel` plugin
2. `metro.config.js` — extend with `withNativeWind()` wrapper
3. `global.css` — import Tailwind directives (`@tailwind base/components/utilities`)
4. `tailwind.config.js` — content paths include `app/**`, `src/**`

NativeWind v4 supports the New Architecture (Fabric) that ships enabled in Expo SDK 55 / React Native 0.85.

**Key conventions**:

- All `className` props use NativeWind utility classes
- `cva()` from `class-variance-authority` is used for component variants
- `cn()` helper = `clsx` + `tailwind-merge` (standard shadcn/ui pattern)
- `tailwindFunctions: ["cva"]` in `.prettierrc` already set for formatter

**Alternatives considered**: Styled-components/emotion — rejected (not Tailwind, heavier, worse integration with react-native-reusables). Inline StyleSheet — rejected (no utility classes, defeats UI system purpose).

---

## R-003: Expo Router v3 Tab Navigation Structure

**Decision**: Use Expo Router's file-based routing with a `(tabs)` route group. Bottom tab navigator is provided by `expo-router`'s `<Tabs>` component (wraps React Navigation). Structure:

```
app/
├── _layout.tsx              # Root layout (DB init, QueryClient, theme)
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator definition (5 tabs)
│   ├── index.tsx            # Dashboard (tab 1)
│   ├── trips.tsx            # Trips (tab 2)
│   ├── costs.tsx            # Costs (tab 3)
│   ├── fuel.tsx             # Fuel (tab 4)
│   └── more.tsx             # More menu (tab 5) → links to sub-screens
├── work-sessions.tsx        # Work Sessions (pushed from More)
├── goals.tsx                # Goals (pushed from More)
└── export.tsx               # Export (pushed from More)
```

The "More" tab acts as a hub screen with list items linking to Work Sessions, Goals, and Export, keeping the bottom tab count at 5 (FR-001). Those screens are full-screen stack pushes rather than tabs.

**Alternatives considered**: Separate tabs for each entity (7+ tabs) — rejected (too many tabs for one-hand Android UX; Constitution Principle II). Drawer navigation — rejected (harder to reach one-handed; tabs are the standard pattern for ride-hailing apps).

---

## R-004: React Query Hook Architecture

**Decision**: All domain use case calls are wrapped in TanStack Query hooks living in `src/application/hooks/`. Each hook follows the `useQueryKey → useQuery/useMutation` pattern:

```
src/application/hooks/
├── use-dashboard-summary.ts    # useQuery → GetDashboardSummary
├── use-trips.ts                # useQuery + useMutation CRUD
├── use-costs.ts                # useQuery + useMutation CRUD
├── use-fuel-logs.ts            # useQuery + useMutation + efficiency
├── use-work-sessions.ts        # useQuery + useMutation + timer
├── use-goals.ts                # useQuery + useMutation + progress
└── use-export.ts               # useMutation → ExportDataAsJSON
```

Query keys are string tuples: `['dashboard', dateRange]`, `['trips', filter]`, etc. On mutation success, related queries are invalidated via `queryClient.invalidateQueries()`.

The `QueryClient` is provided at the root `_layout.tsx` level. Repositories are instantiated once and passed to use case constructors inside each hook (composition root at hook level, not screen level).

**Rationale**: Keeps screens declarative and free of data-fetching logic. Integrates naturally with React Query devtools for debugging. Satisfies Constitution Principle IV (domain use cases remain pure).

**Alternatives considered**: Raw `useEffect` + `useState` — rejected (no caching, no deduplication, hard to manage loading/error states). SWR — rejected (constitution mandates TanStack Query).

---

## R-005: Zustand Store Scope for UI State

**Decision**: Two focused Zustand stores:

1. **`useQuickEntryStore`** — manages the FAB bottom-sheet state:
   - `isOpen: boolean`
   - `entryType: 'trip' | 'cost'`
   - Actions: `openTrip()`, `openCost()`, `close()`

2. **`useActiveSessionStore`** — persists active work session state across navigation:
   - `activeSessionId: string | null`
   - `startedAt: number | null` (Unix ms timestamp)
   - Actions: `startSession(id, startedAt)`, `endSession()`

Zustand stores are not persisted to SQLite — they are in-memory client state. The `activeSessionId` is re-hydrated from the repository on app boot if a session with `endTime = null` exists.

**Rationale**: Zustand is mandatory per the constitution. Limiting stores to 2 satisfies YAGNI (Constitution Principle VII). All server state (trips, costs, etc.) lives in React Query cache, not Zustand.

---

## R-006: JSON Export via expo-sharing + expo-file-system

**Decision**: The `ExportDataAsJSON` use case returns a typed JS object. The UI layer (export hook) serialises it to a JSON string, writes it to the device's cache directory via `expo-file-system` (`FileSystem.writeAsStringAsync`), and then opens the native share sheet via `expo-sharing` (`Sharing.shareAsync`).

**Package versions**:

- `expo-file-system@55.0.16`
- `expo-sharing@55.0.18`

Both are Expo SDK 55 compatible and require no additional Android permissions beyond the app sandbox.

**Alternatives considered**: `react-native-blob-util` — rejected (heavier, requires native build config). Writing directly to Downloads folder — rejected (requires `WRITE_EXTERNAL_STORAGE` permission on Android ≤ 9, complexity not justified for MVP share-sheet use case).

---

## R-007: Icon Strategy

**Decision**: `lucide-react-native@1.8.0` for all icons. Lucide provides a comprehensive icon set as individual tree-shakeable React Native components. Requires `react-native-svg` as a peer dependency (already available via Expo SDK 55).

**Conventions**:

- Icons rendered at `size={24}` by default, `size={20}` for tab bar icons
- Color driven by NativeWind `className` → `color` prop via `useColorScheme()` or the `TextClassContext` pattern from react-native-reusables

**Alternatives considered**: `@expo/vector-icons` (FontAwesome/Ionicons) — rejected (font-based, less tree-shakeable, different API from lucide). Custom SVG assets — rejected (maintenance burden).

---

## R-008: Dark Mode Implementation

**Decision**: NativeWind v4 dark mode via `colorScheme` class strategy. The root `_layout.tsx` reads `useColorScheme()` from `react-native` and applies `dark` class to the root view. All components use `dark:` variants in `className`. Default theme is dark per Constitution Principle II.

A `ThemeProvider` wrapper (copied from react-native-reusables) manages the color scheme context. Colors are defined in `tailwind.config.js` under `theme.extend.colors` using CSS custom properties pattern from the react-native-reusables starter.

**Alternatives considered**: `@react-navigation/native` theme — rejected (not Tailwind-based). Manual StyleSheet switching — rejected (defeats NativeWind purpose).

---

## R-009: Monetary Display Format

**Decision**: All monetary values displayed as `R$ X.XXX,XX` (Brazilian Real, `pt-BR` locale). Format utility: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`. This utility lives in `src/lib/format.ts`.

**Rationale**: Spec assumption states all monetary values in BRL with 2 decimal places. The domain already rounds to 2dp. No i18n library needed for MVP (single locale).
