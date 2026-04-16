import { CreateGoal } from '@/src/application/use-cases/goal/create-goal.use-case'
import { DeleteGoal } from '@/src/application/use-cases/goal/delete-goal.use-case'
import { GetGoalProgress } from '@/src/application/use-cases/goal/get-goal-progress.use-case'
import type { CreateGoalInput } from '@/src/domain/validations/goal'
import { db } from '@/src/infra/db/client'
import { DrizzleGoalRepository } from '@/src/infra/repositories/goal.drizzle-repository'
import { DrizzleTripRepository } from '@/src/infra/repositories/trip.drizzle-repository'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const goalRepo = new DrizzleGoalRepository(db)
const tripRepo = new DrizzleTripRepository(db)
const createUC = new CreateGoal(goalRepo)
const deleteUC = new DeleteGoal(goalRepo)
const progressUC = new GetGoalProgress(goalRepo, tripRepo)

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => goalRepo.findAll(),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGoalInput) => createUC.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUC.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useGoalProgress() {
  return useQuery({
    queryKey: ['goal-progress'],
    queryFn: () => progressUC.execute(),
  })
}
