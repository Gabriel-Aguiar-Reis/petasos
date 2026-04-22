import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/application/**/*.ts',
    'src/domain/**/*.ts',
    'src/lib/**/*.ts',
    'tests/fakes/**/*.ts',
    // Barrel re-export files have no executable logic — exclude from coverage
    '!src/**/index.ts',
    // Native-only modules (React Native, Notifee, Android services) — cannot
    // be tested in a Node environment; covered by device/E2E tests instead
    '!src/lib/notifications.ts',
    '!src/lib/floating-bubble-service-bridge.ts',
  ],
  moduleNameMapper: {
    // notifications.ts imports @notifee/react-native and expo-notifications
    // which are ESM-only native packages — replace with a no-op stub for Jest
    // Must come before the generic @/ mapper so it takes precedence
    '^@/src/lib/notifications$': '<rootDir>/tests/__mocks__/notifications.ts',
    '^expo-notifications$': '<rootDir>/tests/__mocks__/expo-notifications.ts',
    '^@/(.*)$': '<rootDir>/$1',
    // uuid v13 is ESM-only; redirect to CJS-compatible stub for Jest
    '^uuid$': '<rootDir>/tests/__mocks__/uuid.ts',
    // @react-navigation/native requires React Native env; use a minimal stub
    '^@react-navigation/native$':
      '<rootDir>/tests/__mocks__/@react-navigation/native.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { strict: true } }],
  },
}

export default config
