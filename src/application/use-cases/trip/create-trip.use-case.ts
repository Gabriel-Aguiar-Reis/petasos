import { Trip } from '@/src/domain/entities/trip'
import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'
import type { CreateTripInput } from '@/src/domain/validations/trip'
import { v4 as uuidv4 } from 'uuid'

export class CreateTrip {
  constructor(private readonly tripRepository: ITripRepository) {}

  async execute(input: CreateTripInput): Promise<Trip> {
    const trip = Trip.create({ id: uuidv4(), ...input })
    return this.tripRepository.create(trip)
  }
}
