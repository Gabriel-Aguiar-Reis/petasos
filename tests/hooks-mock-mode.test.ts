// ---------------------------------------------------------------------------
// Runs all hooks with USE_MOCK = true, covering the mock-data branches that
// hooks.test.ts leaves uncovered (where USE_MOCK = false).
// ---------------------------------------------------------------------------

jest.mock('@/src/lib/config', () => ({ USE_MOCK: true }))

jest.mock('@/src/infra/db/client', () => ({ db: {} }))

jest.mock('@/src/infra/repositories/trip.drizzle-repository', () => ({
  DrizzleTripRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findByFilter: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}))

jest.mock('@/src/infra/repositories/cost.drizzle-repository', () => ({
  DrizzleCostRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findByFilter: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}))

jest.mock('@/src/infra/repositories/fuel-log.drizzle-repository', () => ({
  DrizzleFuelLogRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findByVehicle: jest.fn(),
  })),
}))

jest.mock('@/src/infra/repositories/work-session.drizzle-repository', () => ({
  DrizzleWorkSessionRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findActive: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}))

jest.mock('@/src/infra/repositories/goal.drizzle-repository', () => ({
  DrizzleGoalRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  })),
}))

jest.mock('@/src/application/use-cases/get-dashboard-summary.use-case', () => ({
  GetDashboardSummary: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock('@/src/application/use-cases/trip/create-trip.use-case', () => ({
  CreateTrip: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock('@/src/application/use-cases/trip/update-trip.use-case', () => ({
  UpdateTrip: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock('@/src/application/use-cases/trip/delete-trip.use-case', () => ({
  DeleteTrip: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock(
  '@/src/application/use-cases/trip/get-trips-by-filter.use-case',
  () => ({
    GetTripsByFilter: jest
      .fn()
      .mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock('@/src/application/use-cases/cost/create-cost.use-case', () => ({
  CreateCost: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock('@/src/application/use-cases/cost/update-cost.use-case', () => ({
  UpdateCost: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock('@/src/application/use-cases/cost/delete-cost.use-case', () => ({
  DeleteCost: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock(
  '@/src/application/use-cases/cost/get-cost-by-filter.use-case',
  () => ({
    GetCostsByFilter: jest
      .fn()
      .mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock(
  '@/src/application/use-cases/fuel-log/create-fuel-log.use-case',
  () => ({
    CreateFuelLog: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock(
  '@/src/application/use-cases/fuel-log/delete-fuel-log.use-case',
  () => ({
    DeleteFuelLog: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock(
  '@/src/application/use-cases/fuel-log/get-fuel-efficiency.use-case',
  () => ({
    GetFuelEfficiency: jest
      .fn()
      .mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock(
  '@/src/application/use-cases/work-session/star-work-session.use-case',
  () => ({
    StartWorkSession: jest
      .fn()
      .mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock(
  '@/src/application/use-cases/work-session/end-work-session.use-case',
  () => ({
    EndWorkSession: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock(
  '@/src/application/use-cases/work-session/delete-work-session.use-case',
  () => ({
    DeleteWorkSession: jest
      .fn()
      .mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock('@/src/application/use-cases/goal/create-goal.use-case', () => ({
  CreateGoal: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock('@/src/application/use-cases/goal/delete-goal.use-case', () => ({
  DeleteGoal: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock('@/src/application/use-cases/goal/get-goal-progress.use-case', () => ({
  GetGoalProgress: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))

jest.mock('@/src/lib/stores/active-session.store', () => ({
  useActiveSessionStore: jest.fn().mockReturnValue({
    startSession: jest.fn(),
    endSession: jest.fn(),
    activeSessionId: null,
    startedAt: null,
  }),
}))

jest.mock('@/src/infra/repositories/user-settings.drizzle-repository', () => ({
  DrizzleUserSettingsRepository: jest.fn().mockImplementation(() => ({})),
}))

jest.mock(
  '@/src/application/use-cases/user-settings/get-user-settings.use-case',
  () => ({
    GetUserSettings: jest
      .fn()
      .mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock(
  '@/src/application/use-cases/user-settings/update-user-settings.use-case',
  () => ({
    UpdateUserSettings: jest
      .fn()
      .mockImplementation(() => ({ execute: jest.fn() })),
  })
)

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn((config: unknown) => config),
  useMutation: jest.fn((config: unknown) => config),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}))

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import {
  useCosts,
  useCreateCost,
  useDeleteCost,
  useUpdateCost,
} from '@/src/application/hooks/use-costs'
import { useDashboardSummary } from '@/src/application/hooks/use-dashboard-summary'
import {
  useCreateFuelLog,
  useDeleteFuelLog,
  useFuelEfficiency,
  useFuelLogs,
} from '@/src/application/hooks/use-fuel-logs'
import {
  useCreateGoal,
  useDeleteGoal,
  useGoalProgress,
  useGoals,
} from '@/src/application/hooks/use-goals'
import {
  useCreateTrip,
  useDeleteTrip,
  useTrips,
  useUpdateTrip,
} from '@/src/application/hooks/use-trips'
import {
  useUpdateUserSettings,
  useUserSettings,
} from '@/src/application/hooks/use-user-settings'
import {
  useDeleteWorkSession,
  useEndWorkSession,
  useStartWorkSession,
  useWorkSessions,
} from '@/src/application/hooks/use-work-sessions'
import {
  MOCK_COSTS,
  MOCK_DASHBOARD,
  MOCK_FUEL_EFFICIENCY,
  MOCK_FUEL_LOGS,
  MOCK_GOAL_PROGRESS,
  MOCK_GOALS,
  MOCK_TRIPS,
  MOCK_USER_SETTINGS,
  MOCK_WORK_SESSIONS,
} from '@/src/lib/mock-data'

type QueryConfig = { queryKey: unknown[]; queryFn: () => Promise<unknown> }
type MutationConfig = {
  mutationFn: (...args: unknown[]) => Promise<unknown>
  onSuccess?: (...args: unknown[]) => void
}

// ---------------------------------------------------------------------------
// Tests — all queryFn/mutationFn must return mock data
// ---------------------------------------------------------------------------

describe('hooks with USE_MOCK = true', () => {
  it('useDashboardSummary queryFn returns MOCK_DASHBOARD', async () => {
    const range = { from: new Date(), to: new Date() }
    const cfg = useDashboardSummary(range) as unknown as QueryConfig
    await expect(cfg.queryFn()).resolves.toEqual(MOCK_DASHBOARD)
  })

  it('useTrips queryFn returns MOCK_TRIPS', async () => {
    const cfg = useTrips() as unknown as QueryConfig
    await expect(cfg.queryFn()).resolves.toEqual(MOCK_TRIPS)
  })

  it('useCreateTrip mutationFn resolves', async () => {
    const cfg = useCreateTrip() as unknown as MutationConfig
    await expect(
      cfg.mutationFn({ earnings: 50, platformId: 'Uber' })
    ).resolves.toBeDefined()
  })

  it('useUpdateTrip mutationFn resolves', async () => {
    const cfg = useUpdateTrip() as unknown as MutationConfig
    await expect(
      cfg.mutationFn({ id: 'trip-1', earnings: 80 })
    ).resolves.toBeDefined()
  })

  it('useDeleteTrip mutationFn resolves', async () => {
    const cfg = useDeleteTrip() as unknown as MutationConfig
    await expect(cfg.mutationFn('trip-1')).resolves.toBeUndefined()
  })

  it('useCosts queryFn returns MOCK_COSTS', async () => {
    const cfg = useCosts() as unknown as QueryConfig
    await expect(cfg.queryFn()).resolves.toEqual(MOCK_COSTS)
  })

  it('useCreateCost mutationFn resolves', async () => {
    const cfg = useCreateCost() as unknown as MutationConfig
    await expect(
      cfg.mutationFn({ amount: 30, category: 'fuel', date: new Date() })
    ).resolves.toBeDefined()
  })

  it('useUpdateCost mutationFn resolves', async () => {
    const cfg = useUpdateCost() as unknown as MutationConfig
    await expect(
      cfg.mutationFn({ id: 'cost-1', amount: 50 })
    ).resolves.toBeDefined()
  })

  it('useDeleteCost mutationFn resolves', async () => {
    const cfg = useDeleteCost() as unknown as MutationConfig
    await expect(cfg.mutationFn('cost-1')).resolves.toBeUndefined()
  })

  it('useFuelLogs queryFn returns MOCK_FUEL_LOGS', async () => {
    const cfg = useFuelLogs() as unknown as QueryConfig
    await expect(cfg.queryFn()).resolves.toEqual(MOCK_FUEL_LOGS)
  })

  it('useCreateFuelLog mutationFn resolves', async () => {
    const cfg = useCreateFuelLog() as unknown as MutationConfig
    await expect(
      cfg.mutationFn({
        fuelType: 'Gasolina',
        liters: 40,
        totalPrice: 280,
        odometer: 50000,
      })
    ).resolves.toBeDefined()
  })

  it('useDeleteFuelLog mutationFn resolves', async () => {
    const cfg = useDeleteFuelLog() as unknown as MutationConfig
    await expect(cfg.mutationFn('fuel-1')).resolves.toBeUndefined()
  })

  it('useFuelEfficiency queryFn returns MOCK_FUEL_EFFICIENCY', async () => {
    const cfg = useFuelEfficiency() as unknown as QueryConfig
    await expect(cfg.queryFn()).resolves.toEqual(MOCK_FUEL_EFFICIENCY)
  })

  it('useGoals queryFn returns MOCK_GOALS', async () => {
    const cfg = useGoals() as unknown as QueryConfig
    await expect(cfg.queryFn()).resolves.toEqual(MOCK_GOALS)
  })

  it('useCreateGoal mutationFn resolves', async () => {
    const cfg = useCreateGoal() as unknown as MutationConfig
    await expect(
      cfg.mutationFn({
        type: 'daily',
        targetAmount: 200,
        periodStart: new Date(),
      })
    ).resolves.toBeDefined()
  })

  it('useDeleteGoal mutationFn resolves', async () => {
    const cfg = useDeleteGoal() as unknown as MutationConfig
    await expect(cfg.mutationFn('goal-1')).resolves.toBeUndefined()
  })

  it('useGoalProgress queryFn returns MOCK_GOAL_PROGRESS', async () => {
    const cfg = useGoalProgress() as unknown as QueryConfig
    await expect(cfg.queryFn()).resolves.toEqual(MOCK_GOAL_PROGRESS)
  })

  it('useWorkSessions queryFn returns MOCK_WORK_SESSIONS', async () => {
    const cfg = useWorkSessions() as unknown as QueryConfig
    await expect(cfg.queryFn()).resolves.toEqual(MOCK_WORK_SESSIONS)
  })

  it('useStartWorkSession mutationFn resolves', async () => {
    const cfg = useStartWorkSession() as unknown as MutationConfig
    await expect(cfg.mutationFn()).resolves.toBeDefined()
  })

  it('useEndWorkSession mutationFn resolves', async () => {
    const cfg = useEndWorkSession() as unknown as MutationConfig
    await expect(cfg.mutationFn()).resolves.toBeDefined()
  })

  it('useDeleteWorkSession mutationFn resolves', async () => {
    const cfg = useDeleteWorkSession() as unknown as MutationConfig
    await expect(cfg.mutationFn('ws-1')).resolves.toBeUndefined()
  })

  it('useUserSettings queryFn returns MOCK_USER_SETTINGS', async () => {
    const cfg = useUserSettings() as unknown as QueryConfig
    await expect(cfg.queryFn()).resolves.toEqual(MOCK_USER_SETTINGS)
  })

  it('useUpdateUserSettings mutationFn returns MOCK_USER_SETTINGS', async () => {
    const cfg = useUpdateUserSettings() as unknown as MutationConfig
    await expect(
      cfg.mutationFn({ id: 'default', currency: 'EUR' })
    ).resolves.toEqual(MOCK_USER_SETTINGS)
  })
})
