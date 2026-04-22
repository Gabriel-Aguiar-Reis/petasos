export type PlatformProfitGoal = {
  id: string
  platformId: string // FK → TripPlatform.id
  targetAmount: number
  tags?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}
