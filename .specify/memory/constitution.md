<!--
SYNC IMPACT REPORT
==================
Version change: [placeholder] → 1.0.0
All principles newly defined (initial ratification).

Added sections:
- Core Principles (7 principles)
- Technology Stack
- MVP Scope & Development Priorities
- Governance

Templates reviewed:
- .specify/templates/plan-template.md   ✅ compatible (Constitution Check section present)
- .specify/templates/spec-template.md   ✅ compatible (FR/SC structure aligns with principles)
- .specify/templates/tasks-template.md  ✅ compatible (phase structure supports offline-first and Clean Arch)

Deferred TODOs: none
-->

# RoadLedger Constitution

## Core Principles

### I. Offline-First (NON-NEGOTIABLE)

Every feature MUST be fully functional without an internet connection.
All writes MUST target local SQLite via Drizzle ORM as the single source of truth.
Network sync is additive and MUST NEVER block or degrade local operations.
Features that require connectivity MUST degrade gracefully with clear user feedback.

**Rationale**: The primary user (a ride-hailing driver) operates in areas with unreliable connectivity.
Data loss due to connectivity failures is unacceptable.

### II. Driver-Centric UX

Any key action (earnings entry, trip log, fuel fill) MUST be completable in ≤ 3 taps from the home screen.
All interactive elements MUST meet a minimum 44×44 dp tap target.
The app MUST support one-hand usage on standard Android form factors.
Dark mode is the primary and default theme; light mode is optional.
Input forms MUST minimize required fields — only essential data at entry time.

**Rationale**: Drivers interact with the app between rides, often while tired or in a hurry.
Friction directly reduces data completeness and daily active usage.

### III. Spec-Driven Development

No feature implementation MUST begin without an approved `spec.md` in the corresponding `/specs/` directory.
Specs MUST define user stories, acceptance scenarios, and measurable success criteria before any code is written.
Implementation MUST NOT deviate from the spec without updating the spec first.

**Rationale**: SDD ensures that every feature has a clear contract, reducing rework and misaligned expectations.

### IV. Clean Architecture & Domain Isolation

The domain layer (entities, use cases, repositories interfaces) MUST contain zero dependencies on
React Native, Expo, SQLite, or any UI/infrastructure framework.
Use cases MUST be the sole orchestrators of business logic.
Repositories MUST be accessed only through interfaces defined in the domain layer.
The data layer (Drizzle, SQLite) implements domain interfaces and MUST NOT leak into the UI layer.

**Rationale**: Clean Architecture ensures the business logic is portable, independently testable,
and resilient to framework upgrades (e.g., migrating from Expo SDK versions).

### V. Platform Agnosticism

All business logic MUST treat ride platforms (Uber, 99, InDrive, etc.) as external data identifiers.
No platform-specific logic MUST be hard-coded in use cases or domain entities.
New platforms MUST be addable without modifying existing domain code (Open/Closed Principle).

**Rationale**: The driver audience spans multiple platforms simultaneously.
Coupling to a single platform would eliminate the app's core value proposition.

### VI. Data Ownership & Exportability

All user-generated data MUST be exportable at any time without data loss.
JSON export MUST be available in MVP scope.
XLSX export is a Post-MVP requirement.
Export MUST support filtering by date range and platform.
No data MUST be stored exclusively in a remote system without a local copy.

**Rationale**: Drivers own their operational data. Vendor lock-in undermines trust and long-term adoption.

### VII. Simplicity & YAGNI

Every abstraction MUST solve a problem that exists now, not one anticipated for the future.
Background tasks, GPS tracking, and cloud sync MUST NOT be added before their corresponding MVP gate is reached.
Complexity MUST be justified in the plan's Complexity Tracking table.
Prefer composition over inheritance; prefer flat module structures over deep nesting.

**Rationale**: Premature abstractions increase maintenance burden without delivering user value.
Post-MVP features are explicitly catalogued in `init.md` and MUST NOT leak into MVP implementation.

## Technology Stack

The following stack is **mandatory and opinionated**. Deviations MUST be approved via a constitution amendment.

| Layer | Technology |
|---|---|
| Runtime | React Native (Expo) — Android only (MVP) |
| Language | TypeScript — strict mode, no `any` |
| UI System | shadcn/ui via React Native Reusables |
| State (client) | Zustand |
| State (server/async) | TanStack Query (React Query) |
| Local database | SQLite via Expo SQLite + Drizzle ORM |
| Notifications | Expo Notifications |
| Background tasks | Expo Task Manager + Background Fetch (Post-MVP) |
| Charts | Victory Native |
| File export | SheetJS (XLSX) — Post-MVP; JSON built-in for MVP |
| Location/GPS | Expo Location (Post-MVP) |

All library upgrades MUST use the latest stable LTS version available at implementation time.
Library additions require a spec-level justification referencing a concrete user story.

## MVP Scope & Development Priorities

The MVP MUST deliver the following and nothing more:

1. Manual earnings entry and cost tracking
2. Basic dashboard with revenue vs. costs summary
3. Trip logging (manual)
4. Fuel tracking (fill logs + km/L calculation)
5. JSON data export

Post-MVP features (MUST NOT be implemented in MVP):

- Notification parsing (Android Notification Listener)
- GPS/background tracking
- Smart insights and predictive earnings
- XLSX export
- Cloud sync / backup
- Multi-vehicle support

Any task that introduces Post-MVP scope MUST be explicitly flagged and deferred.

## Governance

This constitution supersedes all other development practices and conventions.
Amendments MUST follow semantic versioning:

- **MAJOR** — removal or redefinition of a principle; backward-incompatible governance change
- **MINOR** — new principle or section added; material expansion of guidance
- **PATCH** — clarifications, wording fixes, non-semantic refinements

Amendments MUST be documented with a Sync Impact Report (HTML comment at top of this file)
and MUST increment the version line accordingly.

All pull requests MUST verify compliance with the Core Principles before merge.
Complexity violations MUST be documented in the plan's Complexity Tracking table.
The constitution is the reference document for all `/speckit.*` commands in this project.

**Version**: 1.0.0 | **Ratified**: 2026-04-15 | **Last Amended**: 2026-04-15
