import { CreatePlannedAbsence } from '@/src/application/use-cases/planned-absence/create-planned-absence.use-case'
import { DeletePlannedAbsence } from '@/src/application/use-cases/planned-absence/delete-planned-absence.use-case'
import { UpdatePlannedAbsence } from '@/src/application/use-cases/planned-absence/update-planned-absence.use-case'
import { ValidationError } from '@/src/lib/errors'
import { InMemoryPlannedAbsenceRepository } from './fakes/InMemoryPlannedAbsenceRepository'

describe('PlannedAbsence', () => {
  let repo: InMemoryPlannedAbsenceRepository
  let createUc: CreatePlannedAbsence
  let updateUc: UpdatePlannedAbsence
  let deleteUc: DeletePlannedAbsence

  beforeEach(() => {
    repo = new InMemoryPlannedAbsenceRepository()
    createUc = new CreatePlannedAbsence(repo)
    updateUc = new UpdatePlannedAbsence(repo)
    deleteUc = new DeletePlannedAbsence(repo)
  })

  describe('CreatePlannedAbsence', () => {
    it('creates a day_off absence', async () => {
      const a = await createUc.execute({
        type: 'day_off',
        date: new Date('2025-07-04'),
      })
      expect(a.id).toBeTruthy()
      expect(a.type).toBe('day_off')
      expect(a.endDate).toBeUndefined()
    })

    it('creates a vacation absence', async () => {
      const a = await createUc.execute({
        type: 'vacation',
        date: new Date('2025-08-01'),
        endDate: new Date('2025-08-15'),
      })
      expect(a.type).toBe('vacation')
      expect(a.endDate).toEqual(new Date('2025-08-15'))
    })

    it('throws ValidationError when vacation missing endDate', async () => {
      await expect(
        createUc.execute({
          type: 'vacation',
          date: new Date('2025-08-01'),
        } as unknown as Parameters<typeof createUc.execute>[0])
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when vacation endDate < date', async () => {
      await expect(
        createUc.execute({
          type: 'vacation',
          date: new Date('2025-08-15'),
          endDate: new Date('2025-08-01'),
        })
      ).rejects.toThrow(ValidationError)
    })

    it('throws ValidationError when day_off has endDate', async () => {
      await expect(
        createUc.execute({
          type: 'day_off',
          date: new Date('2025-07-04'),
          endDate: new Date('2025-07-05'),
        } as unknown as Parameters<typeof createUc.execute>[0])
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('UpdatePlannedAbsence', () => {
    it('adds workedDays', async () => {
      const a = await createUc.execute({
        type: 'day_off',
        date: new Date('2025-07-04'),
      })
      const workedDays = [new Date('2025-07-05')]
      const updated = await updateUc.execute(a.id, { workedDays })
      expect(updated.workedDays).toEqual(workedDays)
    })

    it('sets cancelledAt', async () => {
      const a = await createUc.execute({
        type: 'vacation',
        date: new Date('2025-08-01'),
        endDate: new Date('2025-08-10'),
      })
      const cancelledAt = new Date('2025-07-30')
      const updated = await updateUc.execute(a.id, { cancelledAt })
      expect(updated.cancelledAt).toEqual(cancelledAt)
    })

    it('throws NotFoundError for unknown id', async () => {
      await expect(
        updateUc.execute('non-existent', { cancelledAt: new Date() })
      ).rejects.toThrow()
    })
  })

  describe('DeletePlannedAbsence', () => {
    it('removes absence from store', async () => {
      const a = await createUc.execute({
        type: 'day_off',
        date: new Date('2025-09-01'),
      })
      await deleteUc.execute(a.id)
      expect(await repo.findById(a.id)).toBeNull()
    })
  })
})
