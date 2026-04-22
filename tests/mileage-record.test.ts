import { CreateMileageRecord } from '@/src/application/use-cases/mileage-record/create-mileage-record.use-case'
import { GetLastMileageRecord } from '@/src/application/use-cases/mileage-record/get-last-mileage-record.use-case'
import { ValidationError } from '@/src/lib/errors'
import { InMemoryMileageRecordRepository } from './fakes/InMemoryMileageRecordRepository'

describe('MileageRecord use cases', () => {
  let repo: InMemoryMileageRecordRepository
  let createMileageRecord: CreateMileageRecord
  let getLastMileageRecord: GetLastMileageRecord

  beforeEach(() => {
    repo = new InMemoryMileageRecordRepository()
    createMileageRecord = new CreateMileageRecord(repo)
    getLastMileageRecord = new GetLastMileageRecord(repo)
  })

  describe('CreateMileageRecord', () => {
    it('creates and returns a mileage record', async () => {
      const record = await createMileageRecord.execute({
        vehicleId: 'v-1',
        mileage: 12000,
        date: new Date('2026-04-01'),
      })
      expect(record.vehicleId).toBe('v-1')
      expect(record.mileage).toBe(12000)
      expect(record.id).toBeTruthy()
    })

    it('defaults date to now when not provided', async () => {
      const before = new Date()
      const record = await createMileageRecord.execute({
        vehicleId: 'v-1',
        mileage: 5000,
      })
      const after = new Date()
      expect(record.date.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(record.date.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('throws ValidationError when mileage is zero', async () => {
      await expect(
        createMileageRecord.execute({ vehicleId: 'v-1', mileage: 0 })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when mileage is negative', async () => {
      await expect(
        createMileageRecord.execute({ vehicleId: 'v-1', mileage: -100 })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when vehicleId is empty', async () => {
      await expect(
        createMileageRecord.execute({ vehicleId: '', mileage: 1000 })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('GetLastMileageRecord', () => {
    it('returns the record with the highest mileage', async () => {
      await createMileageRecord.execute({ vehicleId: 'v-1', mileage: 10000 })
      await createMileageRecord.execute({ vehicleId: 'v-1', mileage: 15000 })
      await createMileageRecord.execute({ vehicleId: 'v-1', mileage: 12000 })

      const latest = await getLastMileageRecord.execute('v-1')
      expect(latest?.mileage).toBe(15000)
    })

    it('returns null when no records exist for vehicle', async () => {
      const result = await getLastMileageRecord.execute('v-nonexistent')
      expect(result).toBeNull()
    })

    it('only returns records for the requested vehicle', async () => {
      await createMileageRecord.execute({ vehicleId: 'v-1', mileage: 20000 })
      await createMileageRecord.execute({ vehicleId: 'v-2', mileage: 5000 })

      const latest = await getLastMileageRecord.execute('v-2')
      expect(latest?.mileage).toBe(5000)
      expect(latest?.vehicleId).toBe('v-2')
    })
  })
})
