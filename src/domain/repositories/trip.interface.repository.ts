import type { Trip } from '@/src/domain/entities/trip'
import type { TripFilter } from '@/src/types/shared.types'

export interface ITripRepository {
  create(trip: Trip): Promise<Trip>
  findById(id: string): Promise<Trip>
  findAll(): Promise<Trip[]>
  findByFilter(filters: TripFilter): Promise<Trip[]>
  update(trip: Trip): Promise<Trip>
  delete(id: string): Promise<void>
}
