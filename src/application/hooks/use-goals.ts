import { CreateGoal } from '@/src/application/use-cases/goal/create-goal.use-case'
import { DeleteGoal } from '@/src/application/use-cases/goal/delete-goal.use-case'
import { GetGoalProgress } from '@/src/application/use-cases/goal/get-goal-progress.use-case'
import type { CreateGoalInput } from '@/src/domain/validations/goal'
import { db } from '@/src/infra/db/client'
import { DrizzleGoalRepository } from '@/src/infra/repositories/goal.drizzle-repository'
import { DrizzleTripRepository } from '@/src/infra/repositories/trip.drizzle-repository'
import { USE_MOCK } from '@/src/lib/config'
import { MOCK_GOAL_PROGRESS, MOCK_GOALS } from '@/src/lib/mock-data'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const goalRepo = new DrizzleGoalRepository(db)
const tripRepo = new DrizzleTripRepository(db)
const createUC = new CreateGoal(goalRepo)
const deleteUC = new DeleteGoal(goalRepo)
const progressUC = new GetGoalProgress(goalRepo, tripRepo)

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => (USE_MOCK ? Promise.resolve(MOCK_GOALS) : goalRepo.findAll()),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGoalInput) =>
      USE_MOCK ? Promise.resolve(MOCK_GOALS[0]) : createUC.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? Promise.resolve() : deleteUC.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useGoalProgress() {
  return useQuery({
    queryKey: ['goal-progress'],
    queryFn: () =>
      USE_MOCK ? Promise.resolve(MOCK_GOAL_PROGRESS) : progressUC.execute(),
  })
}
