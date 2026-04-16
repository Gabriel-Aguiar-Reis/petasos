# Quickstart: Frontend UI Screens — RoadLedger Mobile App

**Feature**: `002-frontend-ui-screens`
**Date**: 2026-04-16

This guide covers how to install new dependencies, configure NativeWind, scaffold the route tree, and run the app on Android.

---

## Prerequisites

- Completed `001-app-backend` — domain entities, use cases, and Drizzle repositories must be in place
- Node.js ≥ 22 LTS
- Android Studio (for emulator) or physical Android device with USB debugging enabled
- Expo Go app or a development build (the app uses SQLite, which requires a dev build for physical devices)

---

## 1. Install New Dependencies

```bash
# NativeWind + Tailwind
npm install nativewind@4.2.3
npm install -D tailwindcss@3

# Utility classname helpers
npm install class-variance-authority@0.7.1 clsx@2.1.1 tailwind-merge@3.5.0

# Icons (requires react-native-svg — included in Expo SDK 55)
npm install lucide-react-native@1.8.0

# @rn-primitives (install only the ones used)
npm install @rn-primitives/slot@1.4.0
npm install @rn-primitives/progress@1.4.0
npm install @rn-primitives/tabs@1.4.0
npm install @rn-primitives/select@1.4.0

# Export
npx expo install expo-file-system expo-sharing
```

---

## 2. Configure NativeWind

### `tailwind.config.js` (create at repo root)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [],
}
```

### `global.css` (create at repo root)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

### `babel.config.js` (update)

```javascript
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: ['nativewind/babel'],
  }
}
```

### `metro.config.js` (create at repo root)

```javascript
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './global.css' })
```

### `nativewind-env.d.ts` (already created by Expo — verify it exists)

```typescript
/// <reference types="nativewind/types" />
```

---

## 3. Add `cn` Helper

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 4. Add Format Helper

```typescript
// src/lib/format.ts
const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(value: number): string {
  return brlFormatter.format(value)
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}
```

---

## 5. Create Zustand Stores

```typescript
// src/lib/stores/quick-entry.store.ts
import { create } from 'zustand'

type QuickEntryType = 'trip' | 'cost'
type QuickEntryState = {
  isOpen: boolean
  entryType: QuickEntryType
  openTrip: () => void
  openCost: () => void
  close: () => void
}

export const useQuickEntryStore = create<QuickEntryState>((set) => ({
  isOpen: false,
  entryType: 'trip',
  openTrip: () => set({ isOpen: true, entryType: 'trip' }),
  openCost: () => set({ isOpen: true, entryType: 'cost' }),
  close: () => set({ isOpen: false }),
}))
```

```typescript
// src/lib/stores/active-session.store.ts
import { create } from 'zustand'

type ActiveSessionState = {
  activeSessionId: string | null
  startedAt: number | null
  startSession: (id: string, startedAt: number) => void
  endSession: () => void
}

export const useActiveSessionStore = create<ActiveSessionState>((set) => ({
  activeSessionId: null,
  startedAt: null,
  startSession: (id, startedAt) => set({ activeSessionId: id, startedAt }),
  endSession: () => set({ activeSessionId: null, startedAt: null }),
}))
```

---

## 6. Update Root Layout

```typescript
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { initializeDatabase } from '@/src/infra/db/client'

const queryClient = new QueryClient()

export default function RootLayout() {
  const colorScheme = useColorScheme()

  useEffect(() => {
    initializeDatabase()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
```

---

## 7. Create Tab Navigator

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Car, Fuel, LayoutDashboard, Menu, Receipt } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#3b82f6' }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} /> }} />
      <Tabs.Screen name="trips" options={{ title: 'Viagens', tabBarIcon: ({ color }) => <Car size={20} color={color} /> }} />
      <Tabs.Screen name="costs" options={{ title: 'Custos', tabBarIcon: ({ color }) => <Receipt size={20} color={color} /> }} />
      <Tabs.Screen name="fuel" options={{ title: 'Combustível', tabBarIcon: ({ color }) => <Fuel size={20} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'Mais', tabBarIcon: ({ color }) => <Menu size={20} color={color} /> }} />
    </Tabs>
  )
}
```

---

## 8. Run the App

```bash
# Start with cache clear (required after babel/metro config changes)
npx expo start -c --android
```

For a development build (needed for SQLite on physical devices):

```bash
npx expo run:android
```

---

## 9. Verify NativeWind is Working

Add a test `className` to any component in a screen:

```tsx
import { Text, View } from 'react-native'

export default function TestScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground text-xl font-bold">NativeWind ✓</Text>
    </View>
  )
}
```

If the background and text colors reflect your theme values, NativeWind is configured correctly.

---

## 10. Development Commands Reference

```bash
# Run all existing domain tests (no UI required)
npx jest tests/

# Type-check the entire project (including new screens)
npx tsc --noEmit

# Format all files
npx prettier --write .

# Regenerate Drizzle migrations (only if schema changed)
npx drizzle-kit generate
```
