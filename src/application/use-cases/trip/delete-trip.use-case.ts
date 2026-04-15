import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'

export class DeleteTrip {
  constructor(private readonly tripRepository: ITripRepository) {}

  async execute(id: string): Promise<void> {
    await this.tripRepository.findById(id)
    await this.tripRepository.delete(id)
  }
}
