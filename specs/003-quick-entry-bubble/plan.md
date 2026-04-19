# Implementation Plan: Floating Bubble Quick Entry

## Overview

This plan describes the technical approach for implementing the floating bubble quick-entry feature on Android with a fallback overlay for older devices.

## Architecture & Stack

- Platform: React Native (Expo) app. MVP target: Android phones (API 30+ preferred).
- Native integration required for Android Bubbles API (Android 11+, API 30+). Implement a small native Android module (Java/Kotlin) that exposes a React Native bridge to: create bubble, show/hide, persist position, and listen for bubble taps.
- Fallback overlay: implement a draw-over overlay using the appropriate Android window type (`SYSTEM_ALERT_WINDOW`) via native module as fallback on older devices.
- Permissions: request runtime permissions and, when needed, guide users to system settings for draw-over permission.
- Quick-entry UI: reuse existing Trip/Cost forms (React components) and present them as a compact overlay (React Native view) launched by the bubble tap.

## Phases

1. Discovery & Architecture (this plan)
2. Native prerequisites checklist (manifest, permissions, gradle config)
3. Implement in-app controls and workflow (start/stop bubble, state UI)
4. Android native module for Bubbles (create/attach bubble, handle tap)
5. Overlay fallback native module (draw-over overlay)
6. Quick-entry overlay UI and integration with existing forms
7. Drag & position persistence (store in local DB / AsyncStorage)
8. State syncing and interruption handling (revoked permissions, device interrupts)
9. QA, tests, and documentation

## Technical Constraints & Notes

- Because the project uses Expo managed workflow, adding a native Android module requires prebuilding (EAS/prebuild) or switching to a bare workflow. Evaluate feasibility and cost.
- If keeping Expo managed, consider implementing the overlay behavior using an external microservice or a companion app (out of scope for MVP). Recommend prebuild to add native module.
- Foreground service is optional for MVP. If notifications must survive deep background, implement a foreground service (native) later.

## Data Model References

- No new persistent entities required beyond storing the bubble position and active state. Use existing local store patterns (`useActiveSessionStore`, `AsyncStorage` or DB via Drizzle for persistence if needed).

## Risks & Mitigations

- Native modules increase release complexity with Expo — mitigate by documenting prebuild steps and producing a migration checklist.
- Android fragmentation: test on API 26–33 devices and emulator images to cover Bubble support and overlay behaviors.

## Deliverables

- `android/` native module with RN bridge for Bubbles and overlay fallback
- `src/components/bubble-control.tsx` — in-app controls
- `src/lib/bubble-service.ts` — JS wrapper calling native bridge
- Quick-entry compact overlay components reusing `trip-form.tsx` and `cost-form.tsx`
- QA checklist and docs in `specs/003-quick-entry-bubble/checklists/`

## Next Steps (developer actions)

1. Create `plan.md` (this file).
2. Confirm Expo prebuild / EAS acceptance for native modules.
3. Implement `bubble-control` UI and permission flow.
4. Implement native bridge for bubbles (Kotlin/Java) and fallback overlay.
5. Integrate quick-entry overlay and validate data flows.
