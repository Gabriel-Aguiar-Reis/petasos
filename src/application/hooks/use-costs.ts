import { CreateCost } from '@/src/application/use-cases/cost/create-cost.use-case'
import { DeleteCost } from '@/src/application/use-cases/cost/delete-cost.use-case'
import { GetCostsByFilter } from '@/src/application/use-cases/cost/get-cost-by-filter.use-case'
import { UpdateCost } from '@/src/application/use-cases/cost/update-cost.use-case'
import type {
  CreateCostInput,
  UpdateCostInput,
} from '@/src/domain/validations/cost'
import { db } from '@/src/infra/db/client'
import { DrizzleCostRepository } from '@/src/infra/repositories/cost.drizzle-repository'
import type { CostFilter } from '@/src/types/shared.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const costRepo = new DrizzleCostRepository(db)
const createUC = new CreateCost(costRepo)
const updateUC = new UpdateCost(costRepo)
const deleteUC = new DeleteCost(costRepo)
const getUC = new GetCostsByFilter(costRepo)

export function useCosts(filter?: CostFilter) {
  return useQuery({
    queryKey: ['costs', filter],
    queryFn: () => getUC.execute(filter ?? {}),
  })
}

export function useCreateCost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCostInput) => createUC.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateCost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateCostInput & { id: string }) =>
      updateUC.execute(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteCost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUC.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
