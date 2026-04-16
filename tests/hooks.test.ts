// ---------------------------------------------------------------------------
// Infrastructure mocks — must come before any imports that use them
// ---------------------------------------------------------------------------

jest.mock('@/src/infra/db/client', () => ({ db: {} }))

// --- Drizzle repositories ---------------------------------------------------

jest.mock('@/src/infra/repositories/trip.drizzle-repository', () => ({
  DrizzleTripRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn().mockResolvedValue([]),
    findByFilter: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock('@/src/infra/repositories/cost.drizzle-repository', () => ({
  DrizzleCostRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn().mockResolvedValue([]),
    findByFilter: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock('@/src/infra/repositories/fuel-log.drizzle-repository', () => ({
  DrizzleFuelLogRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    findByVehicle: jest.fn().mockResolvedValue([]),
  })),
}))

jest.mock('@/src/infra/repositories/work-session.drizzle-repository', () => ({
  DrizzleWorkSessionRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn().mockResolvedValue([]),
    findActive: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock('@/src/infra/repositories/goal.drizzle-repository', () => ({
  DrizzleGoalRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  })),
}))

// --- Use cases ---------------------------------------------------------------

const mockSession = {
  id: 'sess-1',
  startTime: new Date('2026-01-01T08:00:00Z'),
  endTime: null,
}

const mockEnvelope = {
  exportedAt: new Date().toISOString(),
  version: 1 as const,
  data: { trips: [], costs: [], fuelLogs: [], workSessions: [], goals: [] },
}

jest.mock('@/src/application/use-cases/get-dashboard-summary.use-case', () => ({
  GetDashboardSummary: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      totalEarnings: 0,
      totalCosts: 0,
      netProfit: 0,
      byPlatform: [],
    }),
  })),
}))

jest.mock('@/src/application/use-cases/trip/create-trip.use-case', () => ({
  CreateTrip: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      id: 'trip-1',
      earnings: 50,
      platform: 'Uber',
      date: new Date(),
    }),
  })),
}))

jest.mock('@/src/application/use-cases/trip/update-trip.use-case', () => ({
  UpdateTrip: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      id: 'trip-1',
      earnings: 80,
      platform: 'Uber',
      date: new Date(),
    }),
  })),
}))

jest.mock('@/src/application/use-cases/trip/delete-trip.use-case', () => ({
  DeleteTrip: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock(
  '@/src/application/use-cases/trip/get-trips-by-filter.use-case',
  () => ({
    GetTripsByFilter: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue([]),
    })),
  })
)

jest.mock('@/src/application/use-cases/cost/create-cost.use-case', () => ({
  CreateCost: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      id: 'cost-1',
      amount: 30,
      category: 'fuel',
      date: new Date(),
    }),
  })),
}))

jest.mock('@/src/application/use-cases/cost/update-cost.use-case', () => ({
  UpdateCost: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      id: 'cost-1',
      amount: 50,
      category: 'fuel',
      date: new Date(),
    }),
  })),
}))

jest.mock('@/src/application/use-cases/cost/delete-cost.use-case', () => ({
  DeleteCost: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock(
  '@/src/application/use-cases/cost/get-cost-by-filter.use-case',
  () => ({
    GetCostsByFilter: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue([]),
    })),
  })
)

jest.mock(
  '@/src/application/use-cases/fuel-log/create-fuel-log.use-case',
  () => ({
    CreateFuelLog: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue({ id: 'fl-1' }),
    })),
  })
)

jest.mock(
  '@/src/application/use-cases/fuel-log/delete-fuel-log.use-case',
  () => ({
    DeleteFuelLog: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(undefined),
    })),
  })
)

jest.mock(
  '@/src/application/use-cases/fuel-log/get-fuel-efficiency.use-case',
  () => ({
    GetFuelEfficiency: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue([]),
    })),
  })
)

jest.mock(
  '@/src/application/use-cases/work-session/star-work-session.use-case',
  () => ({
    StartWorkSession: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(mockSession),
    })),
  })
)

jest.mock(
  '@/src/application/use-cases/work-session/end-work-session.use-case',
  () => ({
    EndWorkSession: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(undefined),
    })),
  })
)

jest.mock(
  '@/src/application/use-cases/work-session/delete-work-session.use-case',
  () => ({
    DeleteWorkSession: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(undefined),
    })),
  })
)

jest.mock('@/src/application/use-cases/goal/create-goal.use-case', () => ({
  CreateGoal: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({ id: 'goal-1' }),
  })),
}))

jest.mock('@/src/application/use-cases/goal/delete-goal.use-case', () => ({
  DeleteGoal: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock('@/src/application/use-cases/goal/get-goal-progress.use-case', () => ({
  GetGoalProgress: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue([]),
  })),
}))

jest.mock('@/src/application/use-cases/export-data-as-json.use-case', () => ({
  ExportDataAsJSON: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue(mockEnvelope),
  })),
}))

// --- expo-file-system / expo-sharing -----------------------------------------

const mockFileWrite = jest.fn()
const mockFileUri = 'file:///cache/roadledger-export.json'

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({
    write: mockFileWrite,
    uri: mockFileUri,
  })),
  Paths: { cache: 'cache-dir' },
}))

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}))

// --- active-session store (used as a React hook inside work-session hooks) --

jest.mock('@/src/lib/stores/active-session.store', () => ({
  useActiveSessionStore: jest.fn(),
}))

// --- @tanstack/react-query ---------------------------------------------------
// Mocked to return the config object so we can extract and call
// queryFn / mutationFn / onSuccess in tests without a React context.

const mockInvalidateQueries = jest.fn()
const mockQueryClient = { invalidateQueries: mockInvalidateQueries }

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn((config: unknown) => config),
  useMutation: jest.fn((config: unknown) => config),
  useQueryClient: jest.fn(() => mockQueryClient),
}))

// ---------------------------------------------------------------------------
// Imports (run after all mocks are registered)
// ---------------------------------------------------------------------------

import {
  useCosts,
  useCreateCost,
  useDeleteCost,
  useUpdateCost,
} from '@/src/application/hooks/use-costs'
import { useDashboardSummary } from '@/src/application/hooks/use-dashboard-summary'
import { useExportData } from '@/src/application/hooks/use-export'
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
  useDeleteWorkSession,
  useEndWorkSession,
  useStartWorkSession,
  useWorkSessions,
} from '@/src/application/hooks/use-work-sessions'
import { useActiveSessionStore } from '@/src/lib/stores/active-session.store'
import * as Sharing from 'expo-sharing'

// ---------------------------------------------------------------------------
// Helper types for extracted configs
// ---------------------------------------------------------------------------

type QueryConfig = {
  queryKey: unknown[]
  queryFn: () => Promise<unknown>
}

type MutationConfig = {
  mutationFn: (...args: unknown[]) => Promise<unknown>
  onSuccess?: (...args: unknown[]) => void
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const mockStartSession = jest.fn()
const mockEndSession = jest.fn()

beforeEach(() => {
  mockInvalidateQueries.mockClear()
  mockFileWrite.mockClear()
  mockStartSession.mockClear()
  mockEndSession.mockClear()
    ; (Sharing.shareAsync as jest.Mock).mockClear()
    // Set up the active-session store mock return value (called as a React hook)
    ; (useActiveSessionStore as unknown as jest.Mock).mockReturnValue({
      startSession: mockStartSession,
      endSession: mockEndSession,
      activeSessionId: null,
      startedAt: null,
    })
})

// ---------------------------------------------------------------------------
// use-dashboard-summary
// ---------------------------------------------------------------------------

describe('useDashboardSummary', () => {
  const dateRange = { from: new Date('2026-01-01'), to: new Date('2026-01-31') }

  it('passes the correct queryKey', () => {
    const config = useDashboardSummary(dateRange) as unknown as QueryConfig
    expect(config.queryKey).toEqual(['dashboard', dateRange])
  })

  it('queryFn resolves without throwing', async () => {
    const config = useDashboardSummary(dateRange) as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// use-trips
// ---------------------------------------------------------------------------

describe('useTrips', () => {
  it('passes correct queryKey when filter is omitted', () => {
    const config = useTrips() as unknown as QueryConfig
    expect(config.queryKey).toEqual(['trips', undefined])
  })

  it('passes correct queryKey when filter is provided', () => {
    const filter = { platform: 'Uber' }
    const config = useTrips(filter) as unknown as QueryConfig
    expect(config.queryKey).toEqual(['trips', filter])
  })

  it('queryFn resolves (no filter → defaults to {})', async () => {
    const config = useTrips() as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })

  it('queryFn resolves when filter is provided', async () => {
    const config = useTrips({ platform: 'Uber' }) as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })
})

describe('useCreateTrip', () => {
  it('mutationFn resolves', async () => {
    const config = useCreateTrip() as unknown as MutationConfig
    await expect(
      config.mutationFn({ earnings: 50, platform: 'Uber' })
    ).resolves.not.toThrow()
  })

  it('onSuccess invalidates trips and dashboard', async () => {
    const config = useCreateTrip() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['trips'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['dashboard'],
    })
  })
})

describe('useUpdateTrip', () => {
  it('mutationFn resolves', async () => {
    const config = useUpdateTrip() as unknown as MutationConfig
    await expect(
      config.mutationFn({ id: 'trip-1', earnings: 80 })
    ).resolves.not.toThrow()
  })

  it('onSuccess invalidates trips and dashboard', async () => {
    const config = useUpdateTrip() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['trips'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['dashboard'],
    })
  })
})

describe('useDeleteTrip', () => {
  it('mutationFn resolves', async () => {
    const config = useDeleteTrip() as unknown as MutationConfig
    await expect(config.mutationFn('trip-1')).resolves.not.toThrow()
  })

  it('onSuccess invalidates trips and dashboard', async () => {
    const config = useDeleteTrip() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['trips'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['dashboard'],
    })
  })
})

// ---------------------------------------------------------------------------
// use-costs
// ---------------------------------------------------------------------------

describe('useCosts', () => {
  it('passes correct queryKey when filter is omitted', () => {
    const config = useCosts() as unknown as QueryConfig
    expect(config.queryKey).toEqual(['costs', undefined])
  })

  it('passes correct queryKey when filter is provided', () => {
    const filter = { category: 'fuel' }
    const config = useCosts(filter) as unknown as QueryConfig
    expect(config.queryKey).toEqual(['costs', filter])
  })

  it('queryFn resolves (no filter → defaults to {})', async () => {
    const config = useCosts() as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })

  it('queryFn resolves when filter is provided', async () => {
    const config = useCosts({ category: 'fuel' }) as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })
})

describe('useCreateCost', () => {
  it('mutationFn resolves', async () => {
    const config = useCreateCost() as unknown as MutationConfig
    await expect(
      config.mutationFn({ amount: 30, category: 'fuel', date: new Date() })
    ).resolves.not.toThrow()
  })

  it('onSuccess invalidates costs and dashboard', async () => {
    const config = useCreateCost() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['costs'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['dashboard'],
    })
  })
})

describe('useUpdateCost', () => {
  it('mutationFn resolves', async () => {
    const config = useUpdateCost() as unknown as MutationConfig
    await expect(
      config.mutationFn({ id: 'cost-1', amount: 50 })
    ).resolves.not.toThrow()
  })

  it('onSuccess invalidates costs and dashboard', async () => {
    const config = useUpdateCost() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['costs'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['dashboard'],
    })
  })
})

describe('useDeleteCost', () => {
  it('mutationFn resolves', async () => {
    const config = useDeleteCost() as unknown as MutationConfig
    await expect(config.mutationFn('cost-1')).resolves.not.toThrow()
  })

  it('onSuccess invalidates costs and dashboard', async () => {
    const config = useDeleteCost() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['costs'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['dashboard'],
    })
  })
})

// ---------------------------------------------------------------------------
// use-fuel-logs
// ---------------------------------------------------------------------------

describe('useFuelLogs', () => {
  it('passes correct queryKey', () => {
    const config = useFuelLogs() as unknown as QueryConfig
    expect(config.queryKey).toEqual(['fuel-logs'])
  })

  it('queryFn resolves', async () => {
    const config = useFuelLogs() as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })
})

describe('useFuelEfficiency', () => {
  it('passes correct queryKey', () => {
    const config = useFuelEfficiency() as unknown as QueryConfig
    expect(config.queryKey).toEqual(['fuel-efficiency'])
  })

  it('queryFn resolves', async () => {
    const config = useFuelEfficiency() as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })
})

describe('useCreateFuelLog', () => {
  it('mutationFn resolves', async () => {
    const config = useCreateFuelLog() as unknown as MutationConfig
    await expect(
      config.mutationFn({
        fuelType: 'gasoline',
        liters: 40,
        totalPrice: 200,
        odometer: 10000,
        date: new Date(),
      })
    ).resolves.not.toThrow()
  })

  it('onSuccess invalidates fuel-logs and fuel-efficiency', async () => {
    const config = useCreateFuelLog() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['fuel-logs'],
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['fuel-efficiency'],
    })
  })
})

describe('useDeleteFuelLog', () => {
  it('mutationFn resolves', async () => {
    const config = useDeleteFuelLog() as unknown as MutationConfig
    await expect(config.mutationFn('fl-1')).resolves.not.toThrow()
  })

  it('onSuccess invalidates fuel-logs and fuel-efficiency', async () => {
    const config = useDeleteFuelLog() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['fuel-logs'],
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['fuel-efficiency'],
    })
  })
})

// ---------------------------------------------------------------------------
// use-work-sessions
// ---------------------------------------------------------------------------

describe('useWorkSessions', () => {
  it('passes correct queryKey', () => {
    const config = useWorkSessions() as unknown as QueryConfig
    expect(config.queryKey).toEqual(['work-sessions'])
  })

  it('queryFn resolves', async () => {
    const config = useWorkSessions() as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })
})

describe('useStartWorkSession', () => {
  it('mutationFn resolves', async () => {
    const config = useStartWorkSession() as unknown as MutationConfig
    await expect(config.mutationFn()).resolves.not.toThrow()
  })

  it('onSuccess calls startSession with session id and startTime, and invalidates work-sessions', async () => {
    const config = useStartWorkSession() as unknown as MutationConfig
    config.onSuccess!(mockSession)
    expect(mockStartSession).toHaveBeenCalledWith(
      mockSession.id,
      mockSession.startTime.getTime()
    )
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['work-sessions'],
    })
  })
})

describe('useEndWorkSession', () => {
  it('mutationFn resolves', async () => {
    const config = useEndWorkSession() as unknown as MutationConfig
    await expect(config.mutationFn()).resolves.not.toThrow()
  })

  it('onSuccess calls endSession and invalidates work-sessions', async () => {
    const config = useEndWorkSession() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockEndSession).toHaveBeenCalled()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['work-sessions'],
    })
  })
})

describe('useDeleteWorkSession', () => {
  it('mutationFn resolves', async () => {
    const config = useDeleteWorkSession() as unknown as MutationConfig
    await expect(config.mutationFn('sess-1')).resolves.not.toThrow()
  })

  it('onSuccess invalidates work-sessions', async () => {
    const config = useDeleteWorkSession() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['work-sessions'],
    })
  })
})

// ---------------------------------------------------------------------------
// use-goals
// ---------------------------------------------------------------------------

describe('useGoals', () => {
  it('passes correct queryKey', () => {
    const config = useGoals() as unknown as QueryConfig
    expect(config.queryKey).toEqual(['goals'])
  })

  it('queryFn resolves', async () => {
    const config = useGoals() as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })
})

describe('useGoalProgress', () => {
  it('passes correct queryKey', () => {
    const config = useGoalProgress() as unknown as QueryConfig
    expect(config.queryKey).toEqual(['goal-progress'])
  })

  it('queryFn resolves', async () => {
    const config = useGoalProgress() as unknown as QueryConfig
    await expect(config.queryFn()).resolves.not.toThrow()
  })
})

describe('useCreateGoal', () => {
  it('mutationFn resolves', async () => {
    const config = useCreateGoal() as unknown as MutationConfig
    await expect(
      config.mutationFn({
        type: 'daily',
        targetAmount: 200,
        periodStart: new Date(),
      })
    ).resolves.not.toThrow()
  })

  it('onSuccess invalidates goals', async () => {
    const config = useCreateGoal() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['goals'] })
  })
})

describe('useDeleteGoal', () => {
  it('mutationFn resolves', async () => {
    const config = useDeleteGoal() as unknown as MutationConfig
    await expect(config.mutationFn('goal-1')).resolves.not.toThrow()
  })

  it('onSuccess invalidates goals', async () => {
    const config = useDeleteGoal() as unknown as MutationConfig
    config.onSuccess!()
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['goals'] })
  })
})

// ---------------------------------------------------------------------------
// use-export
// ---------------------------------------------------------------------------

describe('useExportData', () => {
  it('mutationFn writes the JSON file and calls shareAsync', async () => {
    const config = useExportData() as unknown as MutationConfig
    await expect(config.mutationFn()).resolves.not.toThrow()
    expect(mockFileWrite).toHaveBeenCalledWith(
      expect.stringContaining('"version"')
    )
    expect(Sharing.shareAsync).toHaveBeenCalledWith(mockFileUri, {
      mimeType: 'application/json',
    })
  })
})
