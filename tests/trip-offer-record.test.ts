import { CreateTripFromOffer } from '@/src/application/use-cases/trip-offer-record/create-trip-from-offer.use-case'
import { EvaluateTripOffer } from '@/src/application/use-cases/trip-offer-record/evaluate-trip-offer.use-case'
import { RecordTripOffer } from '@/src/application/use-cases/trip-offer-record/record-trip-offer.use-case'
import { NotFoundError, ValidationError } from '@/src/lib/errors'
import { InMemoryTripOfferRecordRepository } from './fakes/InMemoryTripOfferRecordRepository'
import { InMemoryTripRepository } from './fakes/InMemoryTripRepository'

const BASE_INPUT = {
  platformId: 'platform-1',
  vehicleId: 'vehicle-1',
  offeredFare: 30,
  estimatedDistance: 10,
  deadheadDistance: 2,
  estimatedDuration: 20,
  deadheadDuration: 5,
}

describe('RecordTripOffer', () => {
  let repo: InMemoryTripOfferRecordRepository
  let useCase: RecordTripOffer

  beforeEach(() => {
    repo = new InMemoryTripOfferRecordRepository()
    useCase = new RecordTripOffer(repo)
  })

  it('creates a trip offer record with generated id', async () => {
    const record = await useCase.execute(BASE_INPUT)
    expect(record.id).toBeTruthy()
    expect(record.platformId).toBe('platform-1')
    expect(record.vehicleId).toBe('vehicle-1')
    expect(record.offeredFare).toBe(30)
  })

  it('sets date to now when not provided', async () => {
    const before = new Date()
    const record = await useCase.execute(BASE_INPUT)
    const after = new Date()
    expect(record.date >= before).toBe(true)
    expect(record.date <= after).toBe(true)
  })

  it('throws ValidationError when platformId is empty', async () => {
    await expect(
      useCase.execute({ ...BASE_INPUT, platformId: '' })
    ).rejects.toThrow(ValidationError)
  })

  it('throws ValidationError when estimatedDistance is negative', async () => {
    await expect(
      useCase.execute({ ...BASE_INPUT, estimatedDistance: -1 })
    ).rejects.toThrow(ValidationError)
  })

  it('throws ValidationError when passengerRating is above 5', async () => {
    await expect(
      useCase.execute({ ...BASE_INPUT, passengerRating: 6 })
    ).rejects.toThrow(ValidationError)
  })
})

describe('EvaluateTripOffer', () => {
  let repo: InMemoryTripOfferRecordRepository
  let useCase: EvaluateTripOffer

  beforeEach(() => {
    repo = new InMemoryTripOfferRecordRepository()
    useCase = new EvaluateTripOffer(repo)
  })

  it('evaluates an existing record with context', async () => {
    const record = await repo.create({
      id: 'offer-1',
      platformId: 'platform-1',
      vehicleId: 'vehicle-1',
      date: new Date(),
      offeredFare: 30,
      estimatedDistance: 10,
      deadheadDistance: 2,
      estimatedDuration: 20,
      deadheadDuration: 5,
    })
    const result = await useCase.execute(record.id, {
      averageConsumption: 12,
      fuelPrice: 6,
      goalAmount: 24,
    })
    expect(result.color).toBe('green')
    expect(result.estimatedProfit).toBe(24)
  })

  it('throws NotFoundError when record does not exist', async () => {
    await expect(
      useCase.execute('nonexistent', { averageConsumption: 12, fuelPrice: 6 })
    ).rejects.toThrow(NotFoundError)
  })
})

describe('CreateTripFromOffer', () => {
  let offerRepo: InMemoryTripOfferRecordRepository
  let tripRepo: InMemoryTripRepository
  let useCase: CreateTripFromOffer

  beforeEach(() => {
    offerRepo = new InMemoryTripOfferRecordRepository()
    tripRepo = new InMemoryTripRepository()
    useCase = new CreateTripFromOffer(offerRepo, tripRepo)
  })

  it('creates a trip with actualEarnings from offer fields', async () => {
    await offerRepo.create({
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      platformId: 'platform-99',
      vehicleId: 'f1e2d3c4-b5a6-4978-8b7c-6d5e4f3a2b1c',
      date: new Date('2025-06-01'),
      offeredFare: 30,
      estimatedDistance: 10,
      deadheadDistance: 2,
      estimatedDuration: 20,
      deadheadDuration: 5,
    })
    const trip = await useCase.execute(
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      28
    )
    expect(trip.earnings).toBe(28)
    expect(trip.platformId).toBe('platform-99')
    expect(trip.distance).toBe(10)
    expect(trip.duration).toBe(20)
    expect(trip.vehicleId).toBe('f1e2d3c4-b5a6-4978-8b7c-6d5e4f3a2b1c')
  })

  it('throws NotFoundError when offer does not exist', async () => {
    await expect(useCase.execute('bad-id', 25)).rejects.toThrow(NotFoundError)
  })
})
