import {
  CreateTripPlatformSchema,
  UpdateTripPlatformSchema,
} from '@/src/domain/validations/trip-platform'

describe('TripPlatform validation', () => {
  it('create accepts name', () => {
    const p = CreateTripPlatformSchema.parse({ name: 'Uber' })
    expect(p.name).toBe('Uber')
  })

  it('update accepts partials', () => {
    const p = UpdateTripPlatformSchema.parse({ description: 'desc' })
    expect(p.description).toBe('desc')
  })
})
