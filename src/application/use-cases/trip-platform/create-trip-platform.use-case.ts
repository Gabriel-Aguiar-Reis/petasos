import type { TripPlatform } from '@/src/domain/entities/trip-platform'
import type { ITripPlatformRepository } from '@/src/domain/repositories/trip-platform.interface.repository'
import type { CreateTripPlatformInput } from '@/src/domain/validations/trip-platform'
import { v4 as uuidv4 } from 'uuid'

export class CreateTripPlatform {
  constructor(
    private readonly tripPlatformRepository: ITripPlatformRepository
  ) {}

  async execute(input: CreateTripPlatformInput): Promise<TripPlatform> {
    const tripPlatform: TripPlatform = { id: uuidv4(), ...input }
    return this.tripPlatformRepository.create(tripPlatform)
  }
}
