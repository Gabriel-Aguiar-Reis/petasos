import type { TripPlatform } from '@/src/domain/entities/trip-platform'
import type { ITripPlatformRepository } from '@/src/domain/repositories/trip-platform.interface.repository'

export class GetAllTripPlatforms {
  constructor(
    private readonly tripPlatformRepository: ITripPlatformRepository
  ) {}

  async execute(): Promise<TripPlatform[]> {
    return this.tripPlatformRepository.findAll()
  }
}
