# Quickstart: App Backend — Domain & Data Layer

**Feature**: `001-app-backend`
**Date**: 2026-04-15

This guide covers how to bootstrap the domain and data layers, run tests, and exercise the main use cases locally.

---

## Prerequisites

- Node.js ≥ 22 LTS
- Android Studio (for emulator) or physical Android device

---

## 1. Initialize the Expo project

```bash
npx create-expo-app@latest petasos --template blank-typescript
cd petasos
```

## 2. Install domain & data dependencies

```bash
# Database
npx expo install expo-sqlite

# Drizzle ORM + kit
npm install drizzle-orm@0.45.2
npm install -D drizzle-kit@0.31.10

# ID generation (ESM+CJS compatible, works with Jest 29)
npm install uuid@13.0.0
npm install -D @types/uuid

# Validation
npm install zod@4.3.6
```

## 3. Configure Drizzle Kit

Create `drizzle.config.ts` at repo root:

```typescript
import type { Config } from 'drizzle-kit';
export default {
  schema: './src/infra/db/schema/*',
  out: './src/infra/db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
```

## 4. Generate and apply migrations

```bash
# Generate migration files from schema
npx drizzle-kit generate

# Migrations are applied automatically at app startup (see src/infra/db/client.ts)
```

## 5. Create the DB client singleton

```typescript
// src/infra/db/client.ts
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './migrations/migrations';
import * as schema from './schema';

const expo = SQLite.openDatabaseSync('roadledger.db');
export const db = drizzle(expo, { schema });

// Call once at app startup (e.g., in app/_layout.tsx)
export async function initializeDatabase() {
  await migrate(db, migrations);
}
```

## 6. Install test dependencies

```bash
npm install -D jest@29.7.0 @types/jest ts-jest@29.4.9
npm install -D @testing-library/react-native@13.3.3
```

Configure `jest.config.ts`:

```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
};
```

## 7. Run the test suite

```bash
# Domain use cases with in-memory repositories (no device required)
npx jest tests/
```

## 8. Example: quick-entry trip via use case

```typescript
import { CreateTrip } from '@/application/use-cases/CreateTrip'
import { InMemoryTripRepository } from '@/../tests/fakes/InMemoryTripRepository'

const repo = new InMemoryTripRepository();
const useCase = new CreateTrip(repo);

const trip = await useCase.execute({
  earnings: 18.50,
  platform: 'Uber',
  // date, origin, destination, distance, duration all optional (quick-entry)
});

console.log(trip.id);       // UUID v4
console.log(trip.earnings); // 18.5
```

## 9. Example: get dashboard summary

```typescript
import { GetDashboardSummary } from '@/application/use-cases/GetDashboardSummary'

const summary = await new GetDashboardSummary(tripRepo, costRepo).execute({
  dateRange: { from: new Date('2026-04-15'), to: new Date('2026-04-15') },
});

console.log(summary.totalEarnings);       // sum of trip earnings
console.log(summary.netProfit);           // earnings − costs
console.log(summary.earningsByPlatform);  // [{ platform: 'Uber', earnings: 18.5 }]
```
