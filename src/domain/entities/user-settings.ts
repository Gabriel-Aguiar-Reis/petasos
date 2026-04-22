export type UserSettings = {
  id: string // always 'default' in single-user MVP
  userId: string // FK → User.id
  preferredUnits: 'km/l' | 'mpg' | 'l/100km'
  currency: string // ISO 4217, default 'BRL'
  displayPreferences: {
    showCosts: boolean
    showProfits: boolean
    showMaintenance: boolean
    showReminders: boolean
  }
  starredTool?:
  | 'costs'
  | 'profits'
  | 'maintenance'
  | 'reminders'
  | 'trips'
  | 'fuel'
  tripOfferPill?: {
    orangeThresholdPct: number
    blueThresholdPct: number
    ratingThresholds?: {
      redBelow: number
      orangeBelow: number
      blueAbove: number
    }
  }
  createdAt: Date
  updatedAt: Date
}

export const DEFAULT_USER_SETTINGS: Omit<
  UserSettings,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
> = {
  preferredUnits: 'km/l',
  currency: 'BRL',
  displayPreferences: {
    showCosts: true,
    showProfits: true,
    showMaintenance: true,
    showReminders: true,
  },
}
