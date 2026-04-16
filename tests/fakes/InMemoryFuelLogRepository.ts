import { FuelLog } from '@/src/domain/entities/fuel-log'
import type { IFuelLogRepository } from '@/src/domain/repositories/fuel-log.interface.repository'
import { NotFoundError } from '@/src/lib/errors'

export class InMemoryFuelLogRepository implements IFuelLogRepository {
  private store: Map<string, FuelLog> = new Map()

  async create(log: FuelLog): Promise<FuelLog> {
    this.store.set(log.id, log)
    return log
  }

  async findById(id: string): Promise<FuelLog> {
    const log = this.store.get(id)
    if (!log) throw new NotFoundError('FuelLog', id)
    return log
  }

  async findAll(): Promise<FuelLog[]> {
    return Array.from(this.store.values())
  }

  async findByFuelTypeOrderedByOdometer(fuelType: string): Promise<FuelLog[]> {
    return Array.from(this.store.values())
      .filter((l) => l.fuelType === fuelType)
      .sort((a, b) => a.odometer - b.odometer)
  }

  async update(log: FuelLog): Promise<FuelLog> {
    await this.findById(log.id)
    this.store.set(log.id, log)
    return log
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    this.store.delete(id)
  }
}
