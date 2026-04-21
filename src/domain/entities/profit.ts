export type Profit = {
  id: string
  date: Date
  amount: number // > 0
  platformId: string // FK → TripPlatform.id
  description?: string
  tags?: string[]
}
