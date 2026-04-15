export type DateRangeFilter = {
  from: Date
  to: Date
}

export type TripFilter = {
  dateRange?: DateRangeFilter
  platform?: string
  vehicleId?: string
}

export type CostFilter = {
  dateRange?: DateRangeFilter
  category?: string
}
