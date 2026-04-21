export type SavedProfitGoal = {
  id: string
  name: string
  targetAmount: number
  period?: 'daily' | 'weekly' | 'monthly' | 'custom'
  tags?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}
