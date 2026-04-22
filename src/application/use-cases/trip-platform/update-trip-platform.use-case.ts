import type { TripPlatform } from '@/src/domain/entities/trip-platform'
import type { ITripPlatformRepository } from '@/src/domain/repositories/trip-platform.interface.repository'
import type { UpdateTripPlatformInput } from '@/src/domain/validations/trip-platform'

export class UpdateTripPlatform {
  constructor(
    private readonly tripPlatformRepository: ITripPlatformRepository
  ) {}

  async execute(
    id: string,
    input: UpdateTripPlatformInput
  ): Promise<TripPlatform> {
    const existing = await this.tripPlatformRepository.findById(id)
    const updated: TripPlatform = {
      ...existing,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.tags !== undefined && { tags: input.tags }),
    }
    return this.tripPlatformRepository.update(updated)
  }
}
