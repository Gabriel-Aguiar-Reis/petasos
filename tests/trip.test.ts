import { CreateTrip } from '@/src/application/use-cases/trip/create-trip.use-case'
import { GetTripsByFilter } from '@/src/application/use-cases/trip/get-trips-by-filter.use-case'
import { UpdateTrip } from '@/src/application/use-cases/trip/update-trip.use-case'
import { ValidationError } from '@/src/lib/errors'
import { InMemoryTripRepository } from '@/tests/fakes/InMemoryTripRepository'

describe('Trip use cases', () => {
  let repo: InMemoryTripRepository

  beforeEach(() => {
    repo = new InMemoryTripRepository()
  })

  describe('CreateTrip', () => {
    it('creates a trip with valid input', async () => {
      const uc = new CreateTrip(repo)
      const trip = await uc.execute({ earnings: 50, platform: 'Uber' })
      expect(trip.id).toBeTruthy()
      expect(trip.earnings).toBe(50)
      expect(trip.platform).toBe('Uber')
      expect(trip.date).toBeInstanceOf(Date)
    })

    it('throws ValidationError when earnings is negative', async () => {
      const uc = new CreateTrip(repo)
      await expect(
        uc.execute({ earnings: -1, platform: 'Uber' })
      ).rejects.toBeInstanceOf(ValidationError)
    })

    it('throws ValidationError when platform is empty', async () => {
      const uc = new CreateTrip(repo)
      await expect(
        uc.execute({ earnings: 10, platform: '' })
      ).rejects.toBeInstanceOf(ValidationError)
    })
  })

  describe('UpdateTrip', () => {
    it('updates earnings on an existing trip', async () => {
      const createUc = new CreateTrip(repo)
      const trip = await createUc.execute({ earnings: 30, platform: 'iFood' })

      const updateUc = new UpdateTrip(repo)
      const updated = await updateUc.execute(trip.id, { earnings: 60 })
      expect(updated.earnings).toBe(60)
    })
  })

  describe('GetTripsByFilter', () => {
    it('filters trips by date range', async () => {
      const createUc = new CreateTrip(repo)
      await createUc.execute({
        earnings: 10,
        platform: 'A',
        date: new Date('2024-01-05'),
      })
      await createUc.execute({
        earnings: 20,
        platform: 'B',
        date: new Date('2024-02-05'),
      })

      const filterUc = new GetTripsByFilter(repo)
      const results = await filterUc.execute({
        dateRange: { from: new Date('2024-01-01'), to: new Date('2024-01-31') },
      })
      expect(results).toHaveLength(1)
      expect(results[0].platform).toBe('A')
    })

    it('throws ValidationError when from > to', async () => {
      const filterUc = new GetTripsByFilter(repo)
      await expect(
        filterUc.execute({
          dateRange: {
            from: new Date('2024-02-01'),
            to: new Date('2024-01-01'),
          },
        })
      ).rejects.toBeInstanceOf(ValidationError)
    })
  })
})
