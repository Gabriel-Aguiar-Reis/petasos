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
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // uuid v13 is ESM-only; redirect to CJS-compatible stub for Jest
    '^uuid$': '<rootDir>/tests/__mocks__/uuid.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { strict: true } }],
  },
}

export default config
