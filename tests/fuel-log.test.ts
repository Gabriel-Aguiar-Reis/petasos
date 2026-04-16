import { CreateFuelLog } from '@/src/application/use-cases/fuel-log/create-fuel-log.use-case'
import { DeleteFuelLog } from '@/src/application/use-cases/fuel-log/delete-fuel-log.use-case'
import { GetFuelEfficiency } from '@/src/application/use-cases/fuel-log/get-fuel-efficiency.use-case'
import { FuelLog } from '@/src/domain/entities/fuel-log'
import { NotFoundError, ValidationError } from '@/src/lib/errors'
import { InMemoryFuelLogRepository } from '@/tests/fakes/InMemoryFuelLogRepository'

describe('FuelLog use cases', () => {
  let repo: InMemoryFuelLogRepository

  beforeEach(() => {
    repo = new InMemoryFuelLogRepository()
  })

  describe('CreateFuelLog', () => {
    it('creates a fuel log with valid input', async () => {
      const uc = new CreateFuelLog(repo)
      const log = await uc.execute({
        fuelType: 'Gasolina',
        liters: 40,
        totalPrice: 240,
        odometer: 10000,
      })
      expect(log.id).toBeTruthy()
      expect(log.fuelType).toBe('Gasolina')
    })

    it('throws ValidationError when odometer does not increase', async () => {
      const uc = new CreateFuelLog(repo)
      await uc.execute({
        fuelType: 'Gasolina',
        liters: 40,
        totalPrice: 240,
        odometer: 10000,
      })
      await expect(
        uc.execute({
          fuelType: 'Gasolina',
          liters: 30,
          totalPrice: 180,
          odometer: 9999,
        })
      ).rejects.toBeInstanceOf(ValidationError)
    })

    it('allows separate odometer sequences per fuel type', async () => {
      const uc = new CreateFuelLog(repo)
      await uc.execute({
        fuelType: 'Gasolina',
        liters: 40,
        totalPrice: 240,
        odometer: 10000,
      })
      // Etanol starts its own sequence — no conflict
      const log = await uc.execute({
        fuelType: 'Etanol',
        liters: 20,
        totalPrice: 100,
        odometer: 5000,
      })
      expect(log.fuelType).toBe('Etanol')
    })
  })

  describe('GetFuelEfficiency', () => {
    it('returns null kmPerLiter when only one log exists for a fuel type', async () => {
      const createUc = new CreateFuelLog(repo)
      await createUc.execute({
        fuelType: 'Gasolina',
        liters: 40,
        totalPrice: 240,
        odometer: 10000,
      })

      const efficiencyUc = new GetFuelEfficiency(repo)
      const results = await efficiencyUc.execute()
      expect(results[0].kmPerLiter).toBeNull()
    })

    it('computes km/L for two consecutive logs', async () => {
      const createUc = new CreateFuelLog(repo)
      await createUc.execute({
        fuelType: 'Gasolina',
        liters: 40,
        totalPrice: 240,
        odometer: 10000,
      })
      await createUc.execute({
        fuelType: 'Gasolina',
        liters: 40,
        totalPrice: 240,
        odometer: 10400,
      })

      const efficiencyUc = new GetFuelEfficiency(repo)
      const results = await efficiencyUc.execute()
      // 400 km / 40 L (second fill) = 10 km/L
      expect(results[0].kmPerLiter).toBe(10)
    })

    it('returns null kmPerLiter when totalLiters sums to zero (defensive branch)', async () => {
      // Inject reconstituted logs directly to bypass use-case validation
      const log1 = FuelLog.reconstitute({
        id: 'dl-a',
        date: new Date(),
        fuelType: 'Diesel',
        liters: 10,
        totalPrice: 50,
        odometer: 100,
      })
      const log2 = FuelLog.reconstitute({
        id: 'dl-b',
        date: new Date(),
        fuelType: 'Diesel',
        liters: 0,
        totalPrice: 0,
        odometer: 200,
      })
      await repo.create(log1)
      await repo.create(log2)
      const results = await new GetFuelEfficiency(repo).execute()
      const diesel = results.find((r) => r.fuelType === 'Diesel')!
      expect(diesel.kmPerLiter).toBeNull()
    })

    it('returns null costPerKm when totalKm is zero (defensive branch)', async () => {
      const log1 = FuelLog.reconstitute({
        id: 'gnv-a',
        date: new Date(),
        fuelType: 'GNV',
        liters: 5,
        totalPrice: 30,
        odometer: 500,
      })
      const log2 = FuelLog.reconstitute({
        id: 'gnv-b',
        date: new Date(),
        fuelType: 'GNV',
        liters: 5,
        totalPrice: 30,
        odometer: 500,
      })
      await repo.create(log1)
      await repo.create(log2)
      const results = await new GetFuelEfficiency(repo).execute()
      const gnv = results.find((r) => r.fuelType === 'GNV')!
      expect(gnv.costPerKm).toBeNull()
    })
  })

  describe('DeleteFuelLog', () => {
    it('deletes an existing fuel log', async () => {
      const createUc = new CreateFuelLog(repo)
      const log = await createUc.execute({
        fuelType: 'Gasolina',
        liters: 30,
        totalPrice: 150,
        odometer: 5000,
      })
      const deleteUc = new DeleteFuelLog(repo)
      await expect(deleteUc.execute(log.id)).resolves.toBeUndefined()
    })

    it('throws NotFoundError when log does not exist', async () => {
      const uc = new DeleteFuelLog(repo)
      await expect(uc.execute('ghost')).rejects.toBeInstanceOf(NotFoundError)
    })
  })
})

describe('FuelLog entity', () => {
  it('reconstitute creates a FuelLog from stored props', () => {
    const log = FuelLog.reconstitute({
      id: '1',
      date: new Date(),
      fuelType: 'Etanol',
      liters: 20,
      totalPrice: 80,
      odometer: 3000,
    })
    expect(log.fuelType).toBe('Etanol')
    expect(log.odometer).toBe(3000)
  })

  it('pricePerLiter computes correctly', () => {
    const log = FuelLog.reconstitute({
      id: '1',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 40,
      totalPrice: 240,
      odometer: 10000,
    })
    expect(log.pricePerLiter).toBe(6)
  })

  it('kmPerLiter returns correct ratio', () => {
    const prev = FuelLog.reconstitute({
      id: 'a',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 40,
      totalPrice: 200,
      odometer: 10000,
    })
    const curr = FuelLog.reconstitute({
      id: 'b',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 40,
      totalPrice: 240,
      odometer: 10400,
    })
    expect(curr.kmPerLiter(prev)).toBe(10)
  })

  it('kmPerLiter returns null when km <= 0', () => {
    const prev = FuelLog.reconstitute({
      id: 'a',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 40,
      totalPrice: 200,
      odometer: 10400,
    })
    const curr = FuelLog.reconstitute({
      id: 'b',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 40,
      totalPrice: 240,
      odometer: 10000,
    })
    expect(curr.kmPerLiter(prev)).toBeNull()
  })

  it('create throws ValidationError when liters is zero', () => {
    expect(() =>
      FuelLog.create({
        id: '1',
        fuelType: 'Gasolina',
        liters: 0,
        totalPrice: 100,
        odometer: 10000,
      })
    ).toThrow(ValidationError)
  })
})

describe('InMemoryFuelLogRepository', () => {
  let repo: InMemoryFuelLogRepository

  beforeEach(() => {
    repo = new InMemoryFuelLogRepository()
  })

  it('findById throws NotFoundError for missing id', async () => {
    await expect(repo.findById('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('update persists changes', async () => {
    const log = FuelLog.reconstitute({
      id: 'x',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 10,
      totalPrice: 60,
      odometer: 100,
    })
    await repo.create(log)
    const updated = FuelLog.reconstitute({
      id: 'x',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 20,
      totalPrice: 120,
      odometer: 100,
    })
    await repo.update(updated)
    const found = await repo.findById('x')
    expect(found.liters).toBe(20)
  })

  it('delete removes the log', async () => {
    const log = FuelLog.reconstitute({
      id: 'y',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 10,
      totalPrice: 60,
      odometer: 100,
    })
    await repo.create(log)
    await repo.delete('y')
    await expect(repo.findById('y')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('findByFuelTypeOrderedByOdometer returns logs sorted ascending by odometer', async () => {
    const log1 = FuelLog.reconstitute({
      id: 'hi',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 10,
      totalPrice: 60,
      odometer: 200,
    })
    const log2 = FuelLog.reconstitute({
      id: 'lo',
      date: new Date(),
      fuelType: 'Gasolina',
      liters: 10,
      totalPrice: 60,
      odometer: 100,
    })
    await repo.create(log1)
    await repo.create(log2)
    const sorted = await repo.findByFuelTypeOrderedByOdometer('Gasolina')
    expect(sorted[0].odometer).toBe(100)
    expect(sorted[1].odometer).toBe(200)
  })
})
