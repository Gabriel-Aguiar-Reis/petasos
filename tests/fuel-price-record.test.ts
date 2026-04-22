import { RecordFuelConsumption } from '@/src/application/use-cases/fuel-consumption-record/record-fuel-consumption.use-case'
import { GetLatestFuelPrice } from '@/src/application/use-cases/fuel-price-record/get-latest-fuel-price.use-case'
import { RecordFuelPrice } from '@/src/application/use-cases/fuel-price-record/record-fuel-price.use-case'
import { ValidationError } from '@/src/lib/errors'
import { InMemoryFuelConsumptionRecordRepository } from './fakes/InMemoryFuelConsumptionRecordRepository'
import { InMemoryFuelPriceRecordRepository } from './fakes/InMemoryFuelPriceRecordRepository'

describe('RecordFuelPrice', () => {
  let repo: InMemoryFuelPriceRecordRepository
  let useCase: RecordFuelPrice

  beforeEach(() => {
    repo = new InMemoryFuelPriceRecordRepository()
    useCase = new RecordFuelPrice(repo)
  })

  it('creates a fuel price record', async () => {
    const record = await useCase.execute({
      fuelTypeId: 'fuel-1',
      pricePerLiter: 6.5,
    })
    expect(record.id).toBeTruthy()
    expect(record.pricePerLiter).toBe(6.5)
    expect(record.fuelTypeId).toBe('fuel-1')
  })

  it('throws ValidationError when pricePerLiter <= 0', async () => {
    await expect(
      useCase.execute({ fuelTypeId: 'fuel-1', pricePerLiter: 0 })
    ).rejects.toThrow(ValidationError)
  })
})

describe('GetLatestFuelPrice', () => {
  let repo: InMemoryFuelPriceRecordRepository
  let record: RecordFuelPrice
  let getLatest: GetLatestFuelPrice

  beforeEach(() => {
    repo = new InMemoryFuelPriceRecordRepository()
    record = new RecordFuelPrice(repo)
    getLatest = new GetLatestFuelPrice(repo)
  })

  it('returns null when no records exist', async () => {
    const result = await getLatest.execute('fuel-1')
    expect(result).toBeNull()
  })

  it('returns the most recent record by date', async () => {
    await record.execute({
      fuelTypeId: 'fuel-1',
      date: new Date('2025-01-01'),
      pricePerLiter: 5.5,
    })
    await record.execute({
      fuelTypeId: 'fuel-1',
      date: new Date('2025-06-01'),
      pricePerLiter: 6.5,
    })
    const result = await getLatest.execute('fuel-1')
    expect(result?.pricePerLiter).toBe(6.5)
  })

  it('returns null for a different fuelTypeId', async () => {
    await record.execute({ fuelTypeId: 'fuel-1', pricePerLiter: 5 })
    const result = await getLatest.execute('fuel-2')
    expect(result).toBeNull()
  })
})

describe('RecordFuelConsumption', () => {
  let repo: InMemoryFuelConsumptionRecordRepository
  let useCase: RecordFuelConsumption

  beforeEach(() => {
    repo = new InMemoryFuelConsumptionRecordRepository()
    useCase = new RecordFuelConsumption(repo)
  })

  it('stores averageConsumption correctly', async () => {
    const result = await useCase.execute({
      vehicleId: 'vehicle-1',
      fuelTypeId: 'fuel-1',
      startMileage: 1000,
      endMileage: 1120,
      fuelAdded: 10,
    })
    expect(result.averageConsumption).toBe(12)
  })

  it('throws ValidationError when endMileage <= startMileage', async () => {
    await expect(
      useCase.execute({
        vehicleId: 'vehicle-1',
        fuelTypeId: 'fuel-1',
        startMileage: 200,
        endMileage: 200,
        fuelAdded: 5,
      })
    ).rejects.toThrow(ValidationError)
  })

  it('throws ValidationError when fuelAdded <= 0', async () => {
    await expect(
      useCase.execute({
        vehicleId: 'vehicle-1',
        fuelTypeId: 'fuel-1',
        startMileage: 100,
        endMileage: 200,
        fuelAdded: 0,
      })
    ).rejects.toThrow(ValidationError)
  })
})
