export type FuelGaugeMeasurement = {
  before: number
  after: number
}

export type FuelPriceRecord = {
  id: string
  fuelTypeId: string // FK → FuelType.id
  date: Date
  pricePerLiter: number
  notes?: string
}
