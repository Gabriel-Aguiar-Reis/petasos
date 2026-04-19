# Feature Specification: Floating Bubble Quick Entry

**Feature Branch**: `003-floating-bubble-feat`  
**Created**: 2026-04-19  
**Status**: Draft  
**Input**: User description: "quero implementar um floating bubble (como o facebook messenger faz) ... lembre-se de mudar para uma branch 003-floating-bubble-feat"

## Clarifications

### Session 2026-04-19

- Q: When the driver taps the bubble outside Petasos, does quick-entry open over the current app or bring Petasos to the foreground? → A: Quick-entry opens as a compact overlay over the current app without foregrounding Petasos.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Enable and Control the Bubble (Priority: P1)

A driver opens Petasos and wants a clear way to activate, stop, and verify the status of the
floating bubble. If device access is missing, the app guides them to the right settings before
trying again.

**Why this priority**: Without a reliable activation and status flow, the feature is unusable and
hard to trust.

**Independent Test**: On a device without prior access, open the bubble controls, follow the
guided path to settings, return to the app, start the bubble, then stop it again.

**Acceptance Scenarios**:

1. **Given** required device access is not granted, **When** the driver opens the bubble controls, **Then** the app shows a blocked state and a direct action to the relevant settings
2. **Given** required device access is granted and the bubble is inactive, **When** the driver taps Start Bubble, **Then** the app reports an active state and the bubble becomes available above other apps
3. **Given** the bubble is active, **When** the driver taps Stop Bubble, **Then** the bubble disappears and the app reports an inactive state
4. **Given** device access is revoked after the bubble was previously active, **When** the driver returns to the bubble controls, **Then** the app shows an action-required state and does not misreport the bubble as active

---

### User Story 2 - Capture a Trip or Cost from Anywhere (Priority: P1)

A driver is using another app or is on the home screen and wants to log a trip or cost without
reopening Petasos. They tap the floating bubble, a compact quick-entry form opens over the
current app, they save the record, and continue what they were doing.

**Why this priority**: The main value of the feature is reducing forgotten records immediately
after a ride or expense happens.

**Independent Test**: Start the bubble, leave Petasos, open another app, tap the bubble, save a
Trip or Cost with the minimum required fields, then return to Petasos and verify the record is
present in the appropriate list and reflected in dashboard totals.

**Acceptance Scenarios**:

1. **Given** the bubble is active, **When** the driver leaves Petasos and opens another app, **Then** the bubble remains visible and reachable on top of the current screen
2. **Given** the bubble is visible over another app, **When** the driver taps it, **Then** a compact quick-entry form opens over the current app without bringing Petasos to the foreground
3. **Given** the bubble quick-entry form is open, **When** the driver saves a Trip with only earnings and platform, **Then** the Trip is stored as a normal record and appears immediately in Petasos
4. **Given** the bubble quick-entry form is open, **When** the driver saves a Cost with only amount and category, **Then** the Cost is stored as a normal record and appears immediately in Petasos
5. **Given** bubble quick-entry is opened, **When** the driver dismisses it without saving, **Then** no partial record is created and the previous app context remains unchanged

---

### User Story 3 - Reposition the Bubble Without Losing Access (Priority: P2)

A driver wants to keep the bubble available but out of the way while using maps, messaging, or
ride apps. They drag it to a better spot and expect it to stay visible and tappable.

**Why this priority**: A persistent overlay is only helpful if it stays unobtrusive and reliable.

**Independent Test**: Start the bubble, drag it to different parts of the screen including near
the edges, and confirm it remains visible and still opens quick-entry from the new position.

**Acceptance Scenarios**:

1. **Given** the bubble is visible, **When** the driver drags it to a different position, **Then** the bubble follows the gesture and remains on-screen after release
2. **Given** the bubble is dragged near an edge, **When** the driver releases it, **Then** the bubble does not disappear outside the visible area
3. **Given** the bubble has been repositioned, **When** the driver taps it later, **Then** quick-entry opens normally from the new position

### Edge Cases

- What happens when the driver taps Start Bubble repeatedly? → Only one active bubble remains visible; duplicates are not created
- What happens when the driver denies device access on first use? → The control screen remains blocked and explains how to try again
- What happens when device access is revoked after activation? → The next app visit shows recovery guidance before another start attempt
- What happens when quick-entry input from the bubble is invalid? → The save is blocked and the driver sees the same validation feedback used in the existing in-app quick-entry flow
- What happens when the bubble is dragged near the top, bottom, or side edges? → It remains at least partially visible and tappable instead of disappearing completely off-screen

## Requirements _(mandatory)_

### Functional Requirements

#### Activation and Status

- **FR-001**: The app MUST provide a dedicated control area where the driver can see the bubble state as blocked, ready, active, or interrupted
- **FR-002**: The app MUST provide a direct path to device settings when required access has not been granted
- **FR-003**: The system MUST prevent bubble activation until required device access is granted
- **FR-004**: The system MUST allow the driver to start the bubble from inside the app and make it available above other apps until the driver stops it or the device interrupts it
- **FR-005**: The system MUST allow the driver to stop the bubble from inside the app and remove it from view promptly
- **FR-006**: The app MUST reflect the current bubble state accurately when the driver returns from device settings or revisits the control area later

#### Quick Entry Behavior

- **FR-007**: The bubble MUST provide direct quick-entry access for Trip and Cost creation without foregrounding Petasos
- **FR-008**: Quick-entry launched from the bubble MUST preserve the existing minimum-field rules for Trip and Cost creation
- **FR-009**: Records created from the bubble MUST use the same validation rules and appear in the same downstream views as records created from the existing in-app quick-entry flow
- **FR-010**: Dismissing bubble quick-entry without saving MUST not create or partially save any record

#### Bubble Interaction

- **FR-011**: The bubble MUST be draggable to different screen positions while remaining usable
- **FR-012**: The bubble MUST remain at least partially visible after repositioning and MUST not be fully released outside the visible screen area
- **FR-013**: Repeated start requests while the bubble is already active MUST not create duplicate bubbles

#### Recovery and Compatibility

- **FR-014**: If device access is revoked or the bubble is interrupted, the app MUST communicate that state and the next recovery action before the driver can attempt to restart it
- **FR-015**: On unsupported platforms or devices, the app MUST present the feature as unavailable without causing errors in the rest of the app

### Key Entities _(include if feature involves data)_

- **Bubble State**: The current availability of the feature for the driver, such as blocked, ready, active, or interrupted
- **Bubble Session**: A period during which the floating bubble is active and available until it is stopped or interrupted
- **Bubble Action**: A quick-entry action started from the bubble over the current app context, including the target record type and whether it was saved or dismissed
- **Bubble Position**: The last visible on-screen location selected by the driver for convenient access

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A first-time driver can move from a blocked state to an active bubble in under 1 minute without external help
- **SC-002**: When required access is already granted, the bubble becomes visible within 3 seconds after the driver taps Start in at least 95% of test attempts
- **SC-003**: A driver can save a Trip or Cost from the bubble in 3 taps or fewer using the existing minimum quick-entry fields
- **SC-004**: In 20 consecutive repeated start attempts without stopping first, drivers never see more than one bubble at the same time
- **SC-005**: In manual QA covering start, stop, permission denial, permission revocation, and app backgrounding, the app reports the correct bubble state on first view in 100% of tested scenarios

## Assumptions

- The feature is intended only for supported Android phones in the MVP; iOS, web, and tablets are out of scope
- The bubble supports only quick Trip and Cost capture; fuel logs, work sessions, goals, and export remain in the main app flows
- Existing quick-entry behavior for Trip and Cost remains the source of truth for required fields and validation outcomes
- Bubble quick-entry is delivered as an overlay on top of the current app context rather than a Petasos foreground navigation flow
- Drivers may need to leave Petasos temporarily to grant device access in system settings before first use
- Newly created records continue to appear in dashboard and list views without a separate bubble-specific history
