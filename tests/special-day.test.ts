import { CreateSpecialDay } from '@/src/application/use-cases/special-day/create-special-day.use-case'
import { DeleteSpecialDay } from '@/src/application/use-cases/special-day/delete-special-day.use-case'
import { SyncOfficialHolidays } from '@/src/application/use-cases/special-day/sync-official-holidays.use-case'
import { SpecialDay } from '@/src/domain/entities/special-day'
import { ConflictError } from '@/src/lib/errors'
import { InMemorySpecialDayRepository } from './fakes/InMemorySpecialDayRepository'

describe('SpecialDay', () => {
  let repo: InMemorySpecialDayRepository
  let createUc: CreateSpecialDay
  let deleteUc: DeleteSpecialDay
  let syncUc: SyncOfficialHolidays

  beforeEach(() => {
    repo = new InMemorySpecialDayRepository()
    createUc = new CreateSpecialDay(repo)
    deleteUc = new DeleteSpecialDay(repo)
    syncUc = new SyncOfficialHolidays(repo)
  })

  describe('CreateSpecialDay', () => {
    it('creates a custom special day', async () => {
      const sd = await createUc.execute({
        date: new Date('2025-12-25'),
        description: 'Christmas',
      })
      expect(sd.id).toBeTruthy()
      expect(sd.source).toBe('custom')
      expect(sd.description).toBe('Christmas')
    })

    it('throws ValidationError when description is empty', async () => {
      const { ValidationError } = await import('@/src/lib/errors')
      await expect(
        createUc.execute({ date: new Date('2025-12-25'), description: '' })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('DeleteSpecialDay', () => {
    it('deletes a custom special day', async () => {
      const sd = await createUc.execute({
        date: new Date('2025-12-25'),
        description: 'Custom holiday',
      })
      await deleteUc.execute(sd.id)
      const found = await repo.findByYear(2025)
      expect(found.map((s) => s.id)).not.toContain(sd.id)
    })

    it('throws ConflictError when deleting an official entry', async () => {
      const official = SpecialDay.reconstitute({
        id: 'official-1',
        date: new Date('2025-01-01'),
        description: 'New Year',
        source: 'official',
      })
      await repo.upsertOfficial(official)
      await expect(deleteUc.execute('official-1')).rejects.toThrow(ConflictError)
    })
  })

  describe('SyncOfficialHolidays', () => {
    it('inserts rows from mocked HTTP response', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { date: '2025-01-01', name: 'Ano Novo', type: 'national' },
          { date: '2025-04-21', name: 'Tiradentes', type: 'national' },
        ],
      } as Response)

      const result = await syncUc.execute(2025)
      expect(result.synced).toBe(2)
      expect(result.skipped).toBe(0)
      const holidays = await repo.findByYear(2025)
      expect(holidays).toHaveLength(2)
    })

    it('returns synced=0 on network failure without throwing', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'))
      const result = await syncUc.execute(2025)
      expect(result.synced).toBe(0)
      expect(result.skipped).toBe(0)
    })
  })
})
