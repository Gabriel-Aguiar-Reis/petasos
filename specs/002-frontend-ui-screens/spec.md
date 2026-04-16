# Feature Specification: Frontend UI Screens — RoadLedger Mobile App

**Feature Branch**: `feat/002-frontend-ui-screens`
**Created**: 2026-04-16
**Status**: Draft
**Input**: User description: "quero implementar agora o frontend do projeto seguindo o init.md e todos os demais documentos que existem no projeto"

## User Scenarios & Testing _(mandatory)_

### User Story 1 — View Daily Financial Summary on Dashboard (Priority: P1)

A driver opens the app and immediately sees their day's financial situation: total earnings,
total costs, net profit, and a breakdown of earnings by platform. The dashboard is the home
screen and loads data without any configuration.

**Why this priority**: The dashboard is the primary reason drivers use the app. It must show
real value immediately on launch. Without it, all data recorded via other screens is invisible.

**Independent Test**: Can be fully tested by seeding local data (trips and costs) and verifying
the dashboard screen displays the correct totals and per-platform breakdown.

**Acceptance Scenarios**:

1. **Given** a driver has recorded trips and costs for the current day, **When** they open the app, **Then** the Dashboard screen shows correct total earnings, total costs, net profit, and a list of earnings per platform
2. **Given** the driver has no data for today, **When** they view the Dashboard, **Then** all monetary values display as R$ 0,00 and a first-use prompt is shown
3. **Given** the driver switches between date ranges (today / this week / this month), **When** they select a new period, **Then** all displayed metrics update to reflect only data within that period
4. **Given** the driver has trips on multiple platforms, **When** they view the Dashboard, **Then** each platform appears as a separate row with its own earnings total

---

### User Story 2 — Register a Trip with Quick-Entry (Priority: P1)

A driver finishes a ride and wants to log it in 3 taps or fewer. They tap the floating action
button, fill in earnings and platform (minimum fields), and save. Optionally, they may also
add origin, destination, distance, and duration.

**Why this priority**: Trip recording is the most frequent action in the app. Fast, low-friction
entry directly determines daily usage habits and data completeness.

**Independent Test**: Can be fully tested by tapping the FAB, entering only earnings + platform,
confirming save, and verifying the trip appears in the trips list and updates the dashboard totals.

**Acceptance Scenarios**:

1. **Given** the driver taps the FAB on any main screen, **When** the quick-entry overlay opens, **Then** the keyboard is focused on the earnings field and at most 2 fields are required (earnings, platform)
2. **Given** valid earnings and platform are entered, **When** the driver taps Save, **Then** the overlay closes, the trip is saved, and the Dashboard and Trips list reflect the new record immediately
3. **Given** the driver wants full detail, **When** they expand the quick-entry form, **Then** origin, destination, distance, duration fields become available without navigating to a different screen
4. **Given** the driver submits an invalid earnings value (negative or non-numeric), **When** they tap Save, **Then** an inline error message is shown and no record is persisted

---

### User Story 3 — Log an Operational Cost (Priority: P1)

A driver records a cost (fuel purchase, maintenance, food, parking/toll, or a custom label).
The entry modal collects: amount, category, date (defaults to today), and an optional note.

**Why this priority**: Costs are the second half of the profit equation. Real-time cost tracking
directly enables the "profitability at a glance" goal of the app.

**Independent Test**: Can be fully tested by opening the cost creation form, entering an amount
and category, saving, and verifying the cost list and dashboard total costs both update.

**Acceptance Scenarios**:

1. **Given** the driver selects "New Cost" from the Costs screen, **When** they enter a positive amount and select a category, **Then** the cost is saved and the Costs list shows the new entry sorted by date descending
2. **Given** the driver selects "custom" as the category, **When** they type a custom label, **Then** the label is stored and displayed exactly as entered
3. **Given** an existing cost entry, **When** the driver edits the amount, **Then** the updated amount is reflected in the list and in the Dashboard total costs
4. **Given** the driver long-presses or swipes a cost entry, **When** they confirm deletion, **Then** the entry is removed and the Dashboard total costs decreases accordingly

---

### User Story 4 — Track Fuel Fill-Up (Priority: P2)

A driver fills up their tank and logs the fill-up: fuel type, liters, total price paid, and
current odometer. The app shows them the calculated km/L efficiency for the last interval of
the same fuel type.

**Why this priority**: Fuel is the largest recurring cost. Tracking it enables the cost-per-km
metric which is the primary efficiency indicator for drivers.

**Independent Test**: Can be fully tested by entering two consecutive fuel logs of the same type
and verifying the km/L value is correctly calculated and displayed on the Fuel screen.

**Acceptance Scenarios**:

1. **Given** the driver opens the Fuel screen, **When** they tap "Add Fill-Up" and enter fuel type, liters, price, and odometer, **Then** the fill-up is saved and appears in the history list
2. **Given** two fill-ups of the same fuel type with valid odometer readings, **When** the driver views fuel efficiency, **Then** km/L and cost-per-km are displayed for the most recent interval
3. **Given** only one fuel log exists for a given type, **When** the driver views efficiency, **Then** a message indicates there is not enough data to calculate efficiency yet
4. **Given** the driver enters an odometer reading lower than the previous entry for the same fuel type, **When** they attempt to save, **Then** an inline validation error is shown and no record is persisted

---

### User Story 5 — Start and Stop a Work Session (Priority: P2)

A driver clocks in when they start working and clocks out when they finish. The app shows the
duration of the current session and a history of past sessions with start time, end time, and
duration.

**Why this priority**: Work session data enables the profit-per-hour metric and gives drivers
visibility over their actual working hours. It requires minimal input and integrates with the
dashboard.

**Independent Test**: Can be fully tested by tapping Clock In, waiting a moment, tapping Clock
Out, and verifying the completed session appears in the sessions list with correct duration.

**Acceptance Scenarios**:

1. **Given** no active session exists, **When** the driver taps "Clock In" on the Work Sessions screen, **Then** a running timer appears showing elapsed time and the button changes to "Clock Out"
2. **Given** an active session is running, **When** the driver taps "Clock Out", **Then** the session is saved with correct start and end times and the timer stops
3. **Given** an active session is running, **When** the driver navigates away and returns to the Work Sessions screen, **Then** the timer continues and shows the correct elapsed time
4. **Given** a completed session, **When** the driver views the session history, **Then** each entry displays the date, start time, end time, and total duration

---

### User Story 6 — Set and Monitor an Earnings Goal (Priority: P2)

A driver defines a daily, weekly, or monthly earnings target. The Goals screen shows a progress
bar for each active goal, the amount achieved so far, and the amount remaining.

**Why this priority**: Goals give drivers a sense of direction and motivation. Progress visualization
is a core differentiator that promotes daily engagement with the app.

**Independent Test**: Can be fully tested by creating a daily goal of R$ 200, recording a trip of
R$ 80, and verifying the goal progress bar shows 40% completion.

**Acceptance Scenarios**:

1. **Given** the driver creates a new goal with type and target amount, **When** they save it, **Then** the goal appears on the Goals screen with a progress bar at 0%
2. **Given** a daily goal is set and trips are recorded on the same day, **When** the driver views the Goals screen, **Then** the progress bar reflects the accumulated earnings for that day
3. **Given** the goal target is reached or exceeded, **When** the driver views the Goals screen, **Then** the progress bar shows 100% and a completion indicator is shown
4. **Given** a goal exists, **When** the driver deletes it, **Then** the goal is removed from the list

---

### User Story 7 — Export All Data as JSON (Priority: P3)

A driver wants to back up or share their data. From the Settings/Export screen, they tap "Export
JSON" and the app generates a JSON file containing all trips, costs, fuel logs, work sessions,
and goals, which is then shared via the device's native share sheet.

**Why this priority**: Data ownership and export are MVP commitments per the init.md. It is a
trust feature — drivers need to know they can take their data with them.

**Independent Test**: Can be fully tested by seeding data across all entity types, triggering
the export, and verifying the resulting JSON contains all expected records.

**Acceptance Scenarios**:

1. **Given** the driver taps "Export JSON" on the Export screen, **When** the export runs, **Then** a native share sheet appears with a valid JSON file attached
2. **Given** multiple entity types have been recorded, **When** the JSON is generated, **Then** it contains top-level keys for `trips`, `costs`, `fuelLogs`, `workSessions`, `goals`, plus `exportedAt` and `filters`
3. **Given** the driver applies a date range filter before exporting, **When** the export runs, **Then** only records within that date range are included in the file

---

### Edge Cases

- What happens when the app is launched for the first time with no data? → Empty state illustrations and onboarding prompts appear on each main screen
- What happens if the driver closes the app while a work session timer is running? → The session start time persists; elapsed time is recalculated on app resume
- What happens if two goals of the same type and overlapping periods both exist? → Both are shown independently on the Goals screen; no deduplication
- What happens when the export JSON is very large (many months of data)? → The share sheet still opens; no in-app size limit is enforced in MVP
- What happens when the driver edits a trip that was used in a goal calculation? → Goal progress automatically reflects the updated earnings on next screen view

## Requirements _(mandatory)_

### Functional Requirements

#### Navigation & Shell

- **FR-001**: The app MUST provide bottom tab navigation with 5 tabs: Dashboard, Trips, Costs, Fuel, and More (which contains Work Sessions, Goals, and Export)
- **FR-002**: A persistent Floating Action Button (FAB) MUST be visible on the Dashboard, Trips, and Costs tabs, opening a quick-entry overlay for Trip or Cost creation
- **FR-003**: The FAB quick-entry overlay MUST require at most 2 fields to save a record (earnings + platform for Trip; amount + category for Cost)
- **FR-004**: All screens MUST function fully offline, with no loading spinners caused by network requests

#### Dashboard Screen

- **FR-005**: The Dashboard MUST display: total earnings, total costs, net profit, and earnings per platform for the selected period
- **FR-006**: The Dashboard MUST support period selection: today, this week, this month
- **FR-007**: The Dashboard MUST show an empty state when no data exists for the selected period

#### Trips Screen

- **FR-008**: The Trips screen MUST list all trips sorted by date descending, showing date, platform, earnings, and distance (if available)
- **FR-009**: Each trip entry MUST support edit and delete actions accessible via swipe or long-press
- **FR-010**: The full trip creation form MUST include: earnings (required), platform (required), date, origin, destination, distance, and duration

#### Costs Screen

- **FR-011**: The Costs screen MUST list all costs sorted by date descending, showing date, category, and amount
- **FR-012**: Each cost entry MUST support edit and delete actions
- **FR-013**: The cost creation form MUST include: amount (required), category (required), date, and an optional custom label when category is "custom"

#### Fuel Screen

- **FR-014**: The Fuel screen MUST list all fuel fill-ups sorted by date descending, showing date, fuel type, liters, and total price
- **FR-015**: The Fuel screen MUST display the km/L efficiency and cost-per-km for the most recent interval of each fuel type, or a "not enough data" message
- **FR-016**: The fuel creation form MUST include: fuel type (required), liters (required), total price (required), and odometer (required)

#### Work Sessions Screen

- **FR-017**: The Work Sessions screen MUST show a "Clock In" button when no session is active, or a running elapsed timer with a "Clock Out" button when a session is active
- **FR-018**: The Work Sessions screen MUST list completed sessions showing date, start time, end time, and duration
- **FR-019**: Completed sessions MUST support deletion

#### Goals Screen

- **FR-020**: The Goals screen MUST allow creating goals with: type (daily, weekly, monthly), target amount, and period start date
- **FR-021**: Each goal MUST display a visual progress bar, the amount achieved, and the amount remaining
- **FR-022**: Goals MUST support deletion

#### Export Screen

- **FR-023**: The Export screen MUST provide a "Export JSON" action that invokes the native share sheet with a `.json` file
- **FR-024**: The Export screen MUST support optional date range filtering before export

### Key Entities

- **Screen**: A navigable route managed by Expo Router; corresponds to one feature domain (Dashboard, Trips, Costs, Fuel, WorkSessions, Goals, Export)
- **Tab**: A bottom navigation entry linking to a primary screen or a grouped "More" section
- **Quick-Entry Overlay**: A bottom sheet or modal that allows creating a Trip or Cost in ≤ 3 taps without full-screen navigation
- **Empty State**: A visual placeholder shown when a list has no data, containing an illustration and a call-to-action

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A driver can record a new trip in 3 taps or fewer from any main screen (tap FAB → enter earnings + platform → tap Save)
- **SC-002**: The Dashboard screen loads and displays metrics within 500 ms of navigation for a dataset of up to 300 trips, 150 costs, and 30 fuel logs
- **SC-003**: All screens render correctly on dark and light mode with no contrast or readability issues
- **SC-004**: A driver can complete the full new-user flow (open app → record first trip → view dashboard) in under 2 minutes without external help
- **SC-005**: The JSON export action produces a valid, complete file and opens the native share sheet within 3 seconds for up to 30 days of data
- **SC-006**: All interactive elements (buttons, list items, inputs) have tap targets of at least 44×44 pt for one-hand usability

## Assumptions

- The app targets Android only in the MVP; iOS layout issues are out of scope
- The backend domain layer (entities, use cases, repositories) from `001-app-backend` is complete and stable; the frontend consumes it without modifying it
- React Query hooks will be introduced in this feature to bridge use cases and screen state
- Navigation uses Expo Router with file-based routes
- UI components use shadcn/ui for React Native (React Native Reusables) and NativeWind (Tailwind CSS)
- Dark mode is the default; light mode must also work without visual defects
- All monetary values are displayed in Brazilian Real (R$) with 2 decimal places
- The "More" tab groups Work Sessions, Goals, and Export to keep the bottom tab count to 5 or fewer
- All icons use `lucide-react-native` (v1+) — no other icon library is used
- Notification parsing, GPS tracking, and charts are Post-MVP and are explicitly out of scope for this feature
