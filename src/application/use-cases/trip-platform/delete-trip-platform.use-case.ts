import type { ITripPlatformRepository } from '@/src/domain/repositories/trip-platform.interface.repository'

export class DeleteTripPlatform {
  constructor(
    private readonly tripPlatformRepository: ITripPlatformRepository
  ) {}

  async execute(id: string): Promise<void> {
    return this.tripPlatformRepository.delete(id)
  }
}
