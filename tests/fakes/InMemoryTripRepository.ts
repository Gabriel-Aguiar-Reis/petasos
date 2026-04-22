import { Trip } from '@/src/domain/entities/trip'
import type { ITripRepository } from '@/src/domain/repositories/trip.interface.repository'
import { NotFoundError } from '@/src/lib/errors'
import type { TripFilter } from '@/src/types/shared.types'

export class InMemoryTripRepository implements ITripRepository {
  private store: Map<string, Trip> = new Map()

  async create(trip: Trip): Promise<Trip> {
    this.store.set(trip.id, trip)
    return trip
  }

  async findById(id: string): Promise<Trip> {
    const trip = this.store.get(id)
    if (!trip) throw new NotFoundError('Trip', id)
    return trip
  }

  async findAll(): Promise<Trip[]> {
    return Array.from(this.store.values())
  }

  async findByFilter(filter: TripFilter): Promise<Trip[]> {
    let results = Array.from(this.store.values())
    if (filter.dateRange) {
      results = results.filter(
        (t) => t.date >= filter.dateRange!.from && t.date <= filter.dateRange!.to
      )
    }
    if (filter.platform) {
      results = results.filter((t) => t.platformId === filter.platform)
    }
    if (filter.vehicleId) {
      results = results.filter((t) => t.vehicleId === filter.vehicleId)
    }
    return results
  }

  async update(trip: Trip): Promise<Trip> {
    await this.findById(trip.id)
    this.store.set(trip.id, trip)
    return trip
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    this.store.delete(id)
  }
}
