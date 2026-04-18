import { CreateTrip } from '@/src/application/use-cases/trip/create-trip.use-case'
import { DeleteTrip } from '@/src/application/use-cases/trip/delete-trip.use-case'
import { GetTripsByFilter } from '@/src/application/use-cases/trip/get-trips-by-filter.use-case'
import { UpdateTrip } from '@/src/application/use-cases/trip/update-trip.use-case'
import type {
  CreateTripInput,
  UpdateTripInput,
} from '@/src/domain/validations/trip'
import { db } from '@/src/infra/db/client'
import { DrizzleTripRepository } from '@/src/infra/repositories/trip.drizzle-repository'
import { USE_MOCK } from '@/src/lib/config'
import { MOCK_TRIPS } from '@/src/lib/mock-data'
import type { TripFilter } from '@/src/types/shared.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const tripRepo = new DrizzleTripRepository(db)
const createUC = new CreateTrip(tripRepo)
const updateUC = new UpdateTrip(tripRepo)
const deleteUC = new DeleteTrip(tripRepo)
const getUC = new GetTripsByFilter(tripRepo)

export function useTrips(filter?: TripFilter) {
  return useQuery({
    queryKey: ['trips', filter],
    queryFn: () =>
      USE_MOCK ? Promise.resolve(MOCK_TRIPS) : getUC.execute(filter ?? {}),
  })
}

export function useCreateTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTripInput) =>
      USE_MOCK ? Promise.resolve(MOCK_TRIPS[0]) : createUC.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTripInput & { id: string }) =>
      USE_MOCK ? Promise.resolve(MOCK_TRIPS[0]) : updateUC.execute(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? Promise.resolve() : deleteUC.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
