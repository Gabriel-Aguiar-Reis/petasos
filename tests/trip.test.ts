import { CreateTrip } from '@/src/application/use-cases/trip/create-trip.use-case'
import { DeleteTrip } from '@/src/application/use-cases/trip/delete-trip.use-case'
import { GetTripsByFilter } from '@/src/application/use-cases/trip/get-trips-by-filter.use-case'
import { UpdateTrip } from '@/src/application/use-cases/trip/update-trip.use-case'
import { Trip } from '@/src/domain/entities/trip'
import { NotFoundError, ValidationError } from '@/src/lib/errors'
import { InMemoryTripRepository } from '@/tests/fakes/InMemoryTripRepository'

describe('Trip use cases', () => {
  let repo: InMemoryTripRepository

  beforeEach(() => {
    repo = new InMemoryTripRepository()
  })

  describe('CreateTrip', () => {
    it('creates a trip with valid input', async () => {
      const uc = new CreateTrip(repo)
      const trip = await uc.execute({ earnings: 50, platformId: 'Uber' })
      expect(trip.id).toBeTruthy()
      expect(trip.earnings).toBe(50)
      expect(trip.platformId).toBe('Uber')
      expect(trip.date).toBeInstanceOf(Date)
    })

    it('throws ValidationError when earnings is negative', async () => {
      const uc = new CreateTrip(repo)
      await expect(
        uc.execute({ earnings: -1, platformId: 'Uber' })
      ).rejects.toBeInstanceOf(ValidationError)
    })

    it('throws ValidationError when platformId is empty', async () => {
      const uc = new CreateTrip(repo)
      await expect(
        uc.execute({ earnings: 10, platformId: '' })
      ).rejects.toBeInstanceOf(ValidationError)
    })
  })

  describe('UpdateTrip', () => {
    it('updates earnings on an existing trip', async () => {
      const createUc = new CreateTrip(repo)
      const trip = await createUc.execute({ earnings: 30, platformId: 'iFood' })

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
        platformId: 'A',
        date: new Date('2024-01-05'),
      })
      await createUc.execute({
        earnings: 20,
        platformId: 'B',
        date: new Date('2024-02-05'),
      })

      const filterUc = new GetTripsByFilter(repo)
      const results = await filterUc.execute({
        dateRange: { from: new Date('2024-01-01'), to: new Date('2024-01-31') },
      })
      expect(results).toHaveLength(1)
      expect(results[0].platformId).toBe('A')
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

  describe('DeleteTrip', () => {
    it('deletes an existing trip', async () => {
      const createUc = new CreateTrip(repo)
      const trip = await createUc.execute({ earnings: 10, platformId: 'Uber' })
      const deleteUc = new DeleteTrip(repo)
      await expect(deleteUc.execute(trip.id)).resolves.toBeUndefined()
    })

    it('throws NotFoundError when trip does not exist', async () => {
      const uc = new DeleteTrip(repo)
      await expect(uc.execute('non-existent')).rejects.toBeInstanceOf(
        NotFoundError
      )
    })
  })

  describe('UpdateTrip — validation', () => {
    it('throws ValidationError when updating with negative earnings', async () => {
      const createUc = new CreateTrip(repo)
      const trip = await createUc.execute({ earnings: 30, platformId: 'iFood' })
      const updateUc = new UpdateTrip(repo)
      await expect(
        updateUc.execute(trip.id, { earnings: -5 })
      ).rejects.toBeInstanceOf(ValidationError)
    })
  })
})

describe('Trip entity', () => {
  const base = {
    id: '1',
    date: new Date(2024, 0, 15),
    earnings: 50,
    platformId: 'Uber',
    distance: null as number | null,
    duration: null as number | null,
    origin: null as string | null,
    destination: null as string | null,
    vehicleId: null as string | null,
  }

  it('isComplete is true when all optional fields are set', () => {
    const trip = Trip.reconstitute({
      ...base,
      distance: 10,
      duration: 20,
      origin: 'A',
      destination: 'B',
    })
    expect(trip.isComplete).toBe(true)
    expect(trip.isQuickEntry).toBe(false)
  })

  it('isComplete is false when a field is null', () => {
    const trip = Trip.reconstitute(base)
    expect(trip.isComplete).toBe(false)
    expect(trip.isQuickEntry).toBe(true)
  })

  it('earningsPerKm returns correct value', () => {
    const trip = Trip.reconstitute({ ...base, distance: 10 })
    expect(trip.earningsPerKm).toBe(5)
  })

  it('earningsPerKm returns null when distance is null', () => {
    const trip = Trip.reconstitute(base)
    expect(trip.earningsPerKm).toBeNull()
  })

  it('earningsPerKm returns null when distance is 0', () => {
    const trip = Trip.reconstitute({ ...base, distance: 0 })
    expect(trip.earningsPerKm).toBeNull()
  })

  it('earningsPerMinute returns correct value', () => {
    const trip = Trip.reconstitute({ ...base, earnings: 60, duration: 30 })
    expect(trip.earningsPerMinute).toBe(2)
  })

  it('earningsPerMinute returns null when duration is null', () => {
    const trip = Trip.reconstitute(base)
    expect(trip.earningsPerMinute).toBeNull()
  })

  it('earningsPerMinute returns null when duration is 0', () => {
    const trip = Trip.reconstitute({ ...base, duration: 0 })
    expect(trip.earningsPerMinute).toBeNull()
  })

  it('update applies destination and vehicleId when provided', () => {
    const trip = Trip.reconstitute(base)
    const updated = trip.update({ destination: 'Airport', vehicleId: null })
    expect(updated.destination).toBe('Airport')
    expect(updated.vehicleId).toBeNull()
  })

  it('update applies distance, duration and origin when provided', () => {
    const trip = Trip.reconstitute(base)
    const updated = trip.update({ distance: 15, duration: 30, origin: 'Home' })
    expect(updated.distance).toBe(15)
    expect(updated.duration).toBe(30)
    expect(updated.origin).toBe('Home')
  })
})

describe('InMemoryTripRepository', () => {
  let repo: InMemoryTripRepository

  beforeEach(() => {
    repo = new InMemoryTripRepository()
  })

  const makeTrip = (
    id: string,
    platformId = 'Uber',
    vehicleId: string | null = null
  ) =>
    Trip.reconstitute({
      id,
      date: new Date(),
      earnings: 10,
      platformId,
      distance: null,
      duration: null,
      origin: null,
      destination: null,
      vehicleId,
    })

  it('findAll returns all stored trips', async () => {
    await repo.create(makeTrip('1'))
    await repo.create(makeTrip('2'))
    expect(await repo.findAll()).toHaveLength(2)
  })

  it('findByFilter filters by platform', async () => {
    await repo.create(makeTrip('1', 'Uber'))
    await repo.create(makeTrip('2', '99'))
    const results = await repo.findByFilter({ platform: 'Uber' })
    expect(results).toHaveLength(1)
    expect(results[0].platformId).toBe('Uber')
  })

  it('findByFilter filters by vehicleId', async () => {
    await repo.create(makeTrip('1', 'Uber', 'v1'))
    await repo.create(makeTrip('2', 'Uber', 'v2'))
    const results = await repo.findByFilter({ vehicleId: 'v1' })
    expect(results).toHaveLength(1)
  })

  it('delete throws NotFoundError on missing trip', async () => {
    await expect(repo.delete('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })
})
