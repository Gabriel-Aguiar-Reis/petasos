import { CreateMaintenance } from '@/src/application/use-cases/maintenance/create-maintenance.use-case'
import { DeleteMaintenance } from '@/src/application/use-cases/maintenance/delete-maintenance.use-case'
import { GetPendingMaintenances } from '@/src/application/use-cases/maintenance/get-pending-maintenances.use-case'
import { UpdateMaintenance } from '@/src/application/use-cases/maintenance/update-maintenance.use-case'
import { ValidationError } from '@/src/lib/errors'
import { InMemoryMaintenanceRepository } from './fakes/InMemoryMaintenanceRepository'

const VEHICLE_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'

describe('Maintenance', () => {
  let repo: InMemoryMaintenanceRepository
  let createUc: CreateMaintenance
  let updateUc: UpdateMaintenance
  let deleteUc: DeleteMaintenance
  let getPendingUc: GetPendingMaintenances

  beforeEach(() => {
    repo = new InMemoryMaintenanceRepository()
    createUc = new CreateMaintenance(repo)
    updateUc = new UpdateMaintenance(repo)
    deleteUc = new DeleteMaintenance(repo)
    getPendingUc = new GetPendingMaintenances(repo)
  })

  describe('CreateMaintenance', () => {
    it('creates with date trigger', async () => {
      const m = await createUc.execute({
        vehicleId: VEHICLE_ID,
        title: 'Oil change',
        estimatedCost: 150,
        trigger: { type: 'date', date: new Date('2025-06-01') },
      })
      expect(m.id).toBeTruthy()
      expect(m.title).toBe('Oil change')
      expect(m.trigger.type).toBe('date')
    })

    it('creates with mileage trigger', async () => {
      const m = await createUc.execute({
        vehicleId: VEHICLE_ID,
        title: 'Tire rotation',
        estimatedCost: 80,
        trigger: { type: 'mileage', mileage: 50000 },
      })
      expect(m.trigger.type).toBe('mileage')
      if (m.trigger.type === 'mileage') {
        expect(m.trigger.mileage).toBe(50000)
      }
    })

    it('throws ValidationError when estimatedCost is zero', async () => {
      await expect(
        createUc.execute({
          vehicleId: VEHICLE_ID,
          title: 'Brake check',
          estimatedCost: 0,
          trigger: { type: 'date', date: new Date('2025-07-01') },
        })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when vehicleId is empty', async () => {
      await expect(
        createUc.execute({
          vehicleId: '',
          title: 'Oil change',
          estimatedCost: 100,
          trigger: { type: 'date', date: new Date('2025-07-01') },
        })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('UpdateMaintenance', () => {
    it('sets completedAt', async () => {
      const m = await createUc.execute({
        vehicleId: VEHICLE_ID,
        title: 'Oil change',
        estimatedCost: 100,
        trigger: { type: 'date', date: new Date('2025-06-01') },
      })
      const completedAt = new Date('2025-06-05')
      const updated = await updateUc.execute(m.id, { completedAt })
      expect(updated.completedAt).toEqual(completedAt)
    })

    it('throws NotFoundError for unknown id', async () => {
      await expect(
        updateUc.execute('non-existent', { title: 'New' })
      ).rejects.toThrow()
    })
  })

  describe('GetPendingMaintenances', () => {
    it('excludes completed records', async () => {
      const m1 = await createUc.execute({
        vehicleId: VEHICLE_ID,
        title: 'Oil change',
        estimatedCost: 100,
        trigger: { type: 'date', date: new Date('2025-06-01') },
      })
      const m2 = await createUc.execute({
        vehicleId: VEHICLE_ID,
        title: 'Tire rotation',
        estimatedCost: 80,
        trigger: { type: 'mileage', mileage: 50000 },
      })
      // Complete m1
      await updateUc.execute(m1.id, { completedAt: new Date() })

      const pending = await getPendingUc.execute()
      expect(pending.map((m) => m.id)).not.toContain(m1.id)
      expect(pending.map((m) => m.id)).toContain(m2.id)
    })

    it('returns empty when all completed', async () => {
      const m = await createUc.execute({
        vehicleId: VEHICLE_ID,
        title: 'Brake check',
        estimatedCost: 120,
        trigger: { type: 'date', date: new Date('2025-08-01') },
      })
      await updateUc.execute(m.id, { completedAt: new Date() })
      const pending = await getPendingUc.execute()
      expect(pending).toHaveLength(0)
    })
  })

  describe('DeleteMaintenance', () => {
    it('removes record from store', async () => {
      const m = await createUc.execute({
        vehicleId: VEHICLE_ID,
        title: 'Filter replacement',
        estimatedCost: 60,
        trigger: { type: 'mileage', mileage: 30000 },
      })
      await deleteUc.execute(m.id)
      expect(await repo.findById(m.id)).toBeNull()
    })
  })
})
