import type { Trip } from '@/src/domain/entities/trip'
import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'
import type { UpdateTripInput } from '@/src/domain/validations/trip'

export class UpdateTrip {
  constructor(private readonly tripRepository: ITripRepository) { }

  async execute(id: string, input: UpdateTripInput): Promise<Trip> {
    const existing = await this.tripRepository.findById(id)
    const updated = existing.update(input)
    return this.tripRepository.update(updated)
  }
}
