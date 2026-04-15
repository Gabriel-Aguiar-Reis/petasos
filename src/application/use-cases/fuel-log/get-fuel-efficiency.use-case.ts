import type { IFuelLogRepository } from '@/src/domain/repositories/fuel-log.interface.repository'

export type FuelEfficiencyResult = {
  fuelType: string
  kmPerLiter: number | null // null if < 2 logs of this type
  costPerKm: number | null // null if kmPerLiter is null
  logCount: number
}

export class GetFuelEfficiency {
  constructor(private readonly fuelLogRepository: IFuelLogRepository) {}

  async execute(): Promise<FuelEfficiencyResult[]> {
    const allLogs = await this.fuelLogRepository.findAll()

    // Group by fuelType
    const grouped = new Map<string, typeof allLogs>()
    for (const log of allLogs) {
      const group = grouped.get(log.fuelType) ?? []
      group.push(log)
      grouped.set(log.fuelType, group)
    }

    const results: FuelEfficiencyResult[] = []

    for (const [fuelType, logs] of grouped) {
      // Sort by odometer ascending (per FR-009)
      const sorted = [...logs].sort((a, b) => a.odometer - b.odometer)

      if (sorted.length < 2) {
        results.push({
          fuelType,
          kmPerLiter: null,
          costPerKm: null,
          logCount: sorted.length,
        })
        continue
      }

      // Compute pairwise km/L across all consecutive pairs
      let totalKm = 0
      let totalLiters = 0
      let totalCost = 0

      for (let i = 1; i < sorted.length; i++) {
        const km = sorted[i].odometer - sorted[i - 1].odometer
        totalKm += km
        totalLiters += sorted[i].liters
        totalCost += sorted[i].totalPrice
      }

      const kmPerLiter =
        totalLiters > 0 ? Math.round((totalKm / totalLiters) * 100) / 100 : null
      const costPerKm =
        totalKm > 0 ? Math.round((totalCost / totalKm) * 100) / 100 : null

      results.push({ fuelType, kmPerLiter, costPerKm, logCount: sorted.length })
    }

    return results
  }
}
