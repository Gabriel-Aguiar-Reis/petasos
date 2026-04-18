import { CreateFuelLog } from '@/src/application/use-cases/fuel-log/create-fuel-log.use-case'
import { DeleteFuelLog } from '@/src/application/use-cases/fuel-log/delete-fuel-log.use-case'
import { GetFuelEfficiency } from '@/src/application/use-cases/fuel-log/get-fuel-efficiency.use-case'
import type { CreateFuelLogInput } from '@/src/domain/validations/fuel-log'
import { db } from '@/src/infra/db/client'
import { DrizzleFuelLogRepository } from '@/src/infra/repositories/fuel-log.drizzle-repository'
import { USE_MOCK } from '@/src/lib/config'
import { MOCK_FUEL_EFFICIENCY, MOCK_FUEL_LOGS } from '@/src/lib/mock-data'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const fuelRepo = new DrizzleFuelLogRepository(db)
const createUC = new CreateFuelLog(fuelRepo)
const deleteUC = new DeleteFuelLog(fuelRepo)
const efficiencyUC = new GetFuelEfficiency(fuelRepo)

export function useFuelLogs() {
  return useQuery({
    queryKey: ['fuel-logs'],
    queryFn: () =>
      USE_MOCK ? Promise.resolve(MOCK_FUEL_LOGS) : fuelRepo.findAll(),
  })
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFuelLogInput) =>
      USE_MOCK ? Promise.resolve(MOCK_FUEL_LOGS[0]) : createUC.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] })
      queryClient.invalidateQueries({ queryKey: ['fuel-efficiency'] })
    },
  })
}

export function useDeleteFuelLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? Promise.resolve() : deleteUC.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] })
      queryClient.invalidateQueries({ queryKey: ['fuel-efficiency'] })
    },
  })
}

export function useFuelEfficiency() {
  return useQuery({
    queryKey: ['fuel-efficiency'],
    queryFn: () =>
      USE_MOCK ? Promise.resolve(MOCK_FUEL_EFFICIENCY) : efficiencyUC.execute(),
  })
}
