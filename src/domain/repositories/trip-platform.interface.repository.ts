import type { TripPlatform } from '@/src/domain/entities/trip-platform'

export interface ITripPlatformRepository {
  create(tripPlatform: TripPlatform): Promise<TripPlatform>
  findById(id: string): Promise<TripPlatform>
  findAll(): Promise<TripPlatform[]>
  update(tripPlatform: TripPlatform): Promise<TripPlatform>
  delete(id: string): Promise<void>
}
