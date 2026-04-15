import { CreateFuelLog } from '@/src/application/use-cases/fuel-log/create-fuel-log.use-case'
import { GetFuelEfficiency } from '@/src/application/use-cases/fuel-log/get-fuel-efficiency.use-case'
import { ValidationError } from '@/src/lib/errors'
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
  })
})
