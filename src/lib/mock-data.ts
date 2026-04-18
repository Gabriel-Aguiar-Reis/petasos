import type { FuelEfficiencyResult } from '@/src/application/use-cases/fuel-log/get-fuel-efficiency.use-case'
import type { GoalProgress } from '@/src/application/use-cases/goal/get-goal-progress.use-case'
import { Cost } from '@/src/domain/entities/cost'
import { FuelLog } from '@/src/domain/entities/fuel-log'
import { Goal } from '@/src/domain/entities/goal'
import { Trip } from '@/src/domain/entities/trip'
import { WorkSession } from '@/src/domain/entities/work-session'
import type { DashboardSummary } from '@/src/types/dashboard-summary.types'
import type { DateRangeFilter } from '@/src/types/shared.types'

// Helper: cria Date sem precisar repetir `new Date(y, m-1, d, h, min)`
function dt(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0
): Date {
  return new Date(year, month - 1, day, hour, minute)
}

// ─── Viagens ──────────────────────────────────────────────────────────────────

export const MOCK_TRIPS: Trip[] = [
  Trip.reconstitute({
    id: 'trip-1',
    date: dt(2026, 4, 18, 8, 30),
    earnings: 45.2,
    platform: 'Uber',
    distance: 35,
    duration: 25,
    origin: 'Centro',
    destination: 'Aeroporto',
    vehicleId: null,
  }),
  Trip.reconstitute({
    id: 'trip-2',
    date: dt(2026, 4, 17, 14, 0),
    earnings: 38.5,
    platform: '99',
    distance: 22,
    duration: 18,
    origin: 'Shopping',
    destination: 'Bairro Jardins',
    vehicleId: null,
  }),
  Trip.reconstitute({
    id: 'trip-3',
    date: dt(2026, 4, 15, 10, 0),
    earnings: 62.0,
    platform: 'Uber',
    distance: 48,
    duration: 40,
    origin: 'Terminal Rodoviário',
    destination: 'Zona Norte',
    vehicleId: null,
  }),
  Trip.reconstitute({
    id: 'trip-4',
    date: dt(2026, 4, 14, 18, 45),
    earnings: 18.75,
    platform: 'iFood',
    distance: 8,
    duration: 15,
    origin: null,
    destination: null,
    vehicleId: null,
  }),
  Trip.reconstitute({
    id: 'trip-5',
    date: dt(2026, 4, 13, 11, 30),
    earnings: 42.3,
    platform: '99',
    distance: 31,
    duration: 25,
    origin: 'Universidade',
    destination: 'Centro Comercial',
    vehicleId: null,
  }),
]

// ─── Custos ───────────────────────────────────────────────────────────────────

export const MOCK_COSTS: Cost[] = [
  Cost.reconstitute({
    id: 'cost-1',
    date: dt(2026, 4, 11, 9, 0),
    amount: 250.0,
    category: 'maintenance',
  }),
  Cost.reconstitute({
    id: 'cost-2',
    date: dt(2026, 4, 16, 12, 30),
    amount: 32.5,
    category: 'food',
  }),
  Cost.reconstitute({
    id: 'cost-3',
    date: dt(2026, 4, 17, 16, 0),
    amount: 15.0,
    category: 'parking_tolls',
  }),
  Cost.reconstitute({
    id: 'cost-4',
    date: dt(2026, 4, 8, 10, 0),
    amount: 80.0,
    category: 'custom',
  }),
]

// ─── Abastecimentos ───────────────────────────────────────────────────────────

export const MOCK_FUEL_LOGS: FuelLog[] = [
  FuelLog.reconstitute({
    id: 'fuel-1',
    date: dt(2026, 3, 19, 8, 0),
    fuelType: 'Gasolina',
    liters: 40,
    totalPrice: 280.0,
    odometer: 50000,
  }),
  FuelLog.reconstitute({
    id: 'fuel-2',
    date: dt(2026, 4, 3, 8, 0),
    fuelType: 'Gasolina',
    liters: 38,
    totalPrice: 266.0,
    odometer: 50512,
  }),
  FuelLog.reconstitute({
    id: 'fuel-3',
    date: dt(2026, 4, 13, 17, 0),
    fuelType: 'Etanol',
    liters: 50,
    totalPrice: 200.0,
    odometer: 51000,
  }),
]

// Gasolina: 512 km / 38 L ≈ 13.47 km/L | custo: 266 / 512 ≈ 0.52 /km
// Etanol: apenas 1 registro → dados insuficientes
export const MOCK_FUEL_EFFICIENCY: FuelEfficiencyResult[] = [
  {
    fuelType: 'Gasolina',
    kmPerLiter: 13.47,
    costPerKm: 0.52,
    logCount: 2,
  },
  {
    fuelType: 'Etanol',
    kmPerLiter: null,
    costPerKm: null,
    logCount: 1,
  },
]

// ─── Metas ────────────────────────────────────────────────────────────────────

const goalDaily = Goal.reconstitute({
  id: 'goal-1',
  type: 'daily',
  targetAmount: 200,
  periodStart: dt(2026, 4, 18),
})

const goalMonthly = Goal.reconstitute({
  id: 'goal-2',
  type: 'monthly',
  targetAmount: 5000,
  periodStart: dt(2026, 4, 1),
})

export const MOCK_GOALS: Goal[] = [goalDaily, goalMonthly]

// totalEarnings abril 2026 = 45.20 + 38.50 + 62.00 + 18.75 + 42.30 = 206.75
export const MOCK_GOAL_PROGRESS: GoalProgress[] = [
  {
    goal: goalDaily,
    periodRange: {
      from: dt(2026, 4, 18),
      to: new Date(2026, 3, 18, 23, 59, 59, 999),
    },
    actualEarnings: 45.2,
    remainingAmount: 154.8,
    achieved: false,
  },
  {
    goal: goalMonthly,
    periodRange: {
      from: dt(2026, 4, 1),
      to: new Date(2026, 3, 30, 23, 59, 59, 999),
    },
    actualEarnings: 206.75,
    remainingAmount: 4793.25,
    achieved: false,
  },
]

// ─── Sessões de trabalho ───────────────────────────────────────────────────────

export const MOCK_WORK_SESSIONS: WorkSession[] = [
  WorkSession.reconstitute({
    id: 'ws-1',
    startTime: dt(2026, 4, 17, 8, 0),
    endTime: dt(2026, 4, 17, 18, 0),
  }),
  WorkSession.reconstitute({
    id: 'ws-2',
    startTime: dt(2026, 4, 15, 9, 0),
    endTime: dt(2026, 4, 15, 17, 30),
  }),
  WorkSession.reconstitute({
    id: 'ws-3',
    startTime: dt(2026, 4, 18, 7, 0),
    endTime: null,
  }),
]

// ─── Dashboard ────────────────────────────────────────────────────────────────

const todayRange: DateRangeFilter = {
  from: dt(2026, 4, 18),
  to: new Date(2026, 3, 18, 23, 59, 59, 999),
}

export const MOCK_DASHBOARD: DashboardSummary = {
  dateRange: todayRange,
  totalEarnings: 45.2,
  totalCosts: 0,
  netProfit: 45.2,
  earningsByPlatform: [{ platform: 'Uber', earnings: 45.2 }],
  costPerKm: 1.29,
}
