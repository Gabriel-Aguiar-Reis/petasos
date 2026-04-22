import { GetUserSettings } from '@/src/application/use-cases/user-settings/get-user-settings.use-case'
import { UpdateUserSettings } from '@/src/application/use-cases/user-settings/update-user-settings.use-case'
import { ValidationError } from '@/src/lib/errors'
import { InMemoryUserSettingsRepository } from './fakes/InMemoryUserSettingsRepository'

describe('UserSettings', () => {
  let repo: InMemoryUserSettingsRepository
  let getUc: GetUserSettings
  let updateUc: UpdateUserSettings

  beforeEach(() => {
    repo = new InMemoryUserSettingsRepository()
    getUc = new GetUserSettings(repo)
    updateUc = new UpdateUserSettings(repo)
  })

  describe('GetUserSettings', () => {
    it('returns default settings when empty', async () => {
      const settings = await getUc.execute()
      expect(settings.id).toBe('default')
      expect(settings.preferredUnits).toBe('km/l')
      expect(settings.currency).toBe('BRL')
      expect(settings.displayPreferences.showCosts).toBe(true)
      expect(settings.displayPreferences.showProfits).toBe(true)
      expect(settings.displayPreferences.showMaintenance).toBe(true)
      expect(settings.displayPreferences.showReminders).toBe(true)
      expect(settings.starredTool).toBeUndefined()
      expect(settings.tripOfferPill).toBeUndefined()
    })
  })

  describe('UpdateUserSettings', () => {
    it('persists custom values', async () => {
      const updated = await updateUc.execute({
        preferredUnits: 'mpg',
        currency: 'USD',
      })
      expect(updated.preferredUnits).toBe('mpg')
      expect(updated.currency).toBe('USD')
    })

    it('returns custom values after update', async () => {
      await updateUc.execute({
        preferredUnits: 'l/100km',
        currency: 'EUR',
        starredTool: 'fuel',
      })
      const settings = await getUc.execute()
      expect(settings.preferredUnits).toBe('l/100km')
      expect(settings.currency).toBe('EUR')
      expect(settings.starredTool).toBe('fuel')
    })

    it('throws ValidationError on invalid preferredUnits', async () => {
      await expect(
        updateUc.execute({
          preferredUnits: 'invalid' as 'km/l',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError on currency too short', async () => {
      await expect(updateUc.execute({ currency: 'US' })).rejects.toThrow(
        ValidationError
      )
    })

    it('merges partial displayPreferences', async () => {
      await updateUc.execute({
        displayPreferences: { showCosts: false },
      })
      const settings = await getUc.execute()
      expect(settings.displayPreferences.showCosts).toBe(false)
      expect(settings.displayPreferences.showProfits).toBe(true)
    })

    it('handles tripOfferPill thresholds', async () => {
      await updateUc.execute({
        tripOfferPill: {
          orangeThresholdPct: 10,
          blueThresholdPct: 25,
          ratingThresholds: {
            redBelow: 3.5,
            orangeBelow: 4.0,
            blueAbove: 4.9,
          },
        },
      })
      const settings = await getUc.execute()
      expect(settings.tripOfferPill?.orangeThresholdPct).toBe(10)
      expect(settings.tripOfferPill?.blueThresholdPct).toBe(25)
      expect(settings.tripOfferPill?.ratingThresholds?.redBelow).toBe(3.5)
    })

    it('clears starredTool when set to null', async () => {
      await updateUc.execute({ starredTool: 'trips' })
      await updateUc.execute({ starredTool: null })
      const settings = await getUc.execute()
      expect(settings.starredTool).toBeUndefined()
    })

    it('clears tripOfferPill when set to null', async () => {
      await updateUc.execute({
        tripOfferPill: { orangeThresholdPct: 10, blueThresholdPct: 20 },
      })
      await updateUc.execute({ tripOfferPill: null })
      const settings = await getUc.execute()
      expect(settings.tripOfferPill).toBeUndefined()
    })
  })
})
