import { PremiumValidatorService } from '@/src/application/services/premium-validator.service'

describe('PremiumValidatorService', () => {
  let premiumValidator: PremiumValidatorService

  beforeEach(() => {
    premiumValidator = new PremiumValidatorService()
  })

  it('should return false for non-premium users', async () => {
    expect(await PremiumValidatorService.isPremium()).toBe(false)
  })
})
