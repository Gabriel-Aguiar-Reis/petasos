import { CreateReminder } from '@/src/application/use-cases/reminder/create-reminder.use-case'
import { DeleteReminder } from '@/src/application/use-cases/reminder/delete-reminder.use-case'
import { UpdateReminder } from '@/src/application/use-cases/reminder/update-reminder.use-case'
import { ValidationError } from '@/src/lib/errors'
import * as Notifications from 'expo-notifications'
import { InMemoryReminderRepository } from './fakes/InMemoryReminderRepository'

describe('Reminder', () => {
  let repo: InMemoryReminderRepository
  let createUc: CreateReminder
  let updateUc: UpdateReminder
  let deleteUc: DeleteReminder

  beforeEach(() => {
    repo = new InMemoryReminderRepository()
    createUc = new CreateReminder(repo)
    updateUc = new UpdateReminder(repo)
    deleteUc = new DeleteReminder(repo)
    jest.clearAllMocks()
  })

  describe('CreateReminder', () => {
    it('persists a reminder correctly', async () => {
      const r = await createUc.execute({
        message: 'Check oil level',
        date: new Date('2025-09-01'),
        alarm: false,
      })
      expect(r.id).toBeTruthy()
      expect(r.message).toBe('Check oil level')
      expect(r.alarm).toBe(false)
    })

    it('alarm=true triggers notification', async () => {
      await createUc.execute({
        message: 'Oil change due',
        date: new Date('2025-09-01'),
        alarm: true,
      })
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1)
    })

    it('alarm=false skips notification', async () => {
      await createUc.execute({
        message: 'Oil change due',
        date: new Date('2025-09-01'),
        alarm: false,
      })
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
    })

    it('throws ValidationError when message is empty', async () => {
      await expect(
        createUc.execute({ message: '', date: new Date(), alarm: false })
      ).rejects.toThrow(ValidationError)
    })

    it('stores and retrieves recurrence field', async () => {
      const r = await createUc.execute({
        message: 'Monthly check',
        date: new Date('2025-01-01'),
        alarm: false,
        recurrence: { rule: 'FREQ=MONTHLY;COUNT=12' },
      })
      expect(r.recurrence?.rule).toBe('FREQ=MONTHLY;COUNT=12')
      const found = await repo.findById(r.id)
      expect(found?.recurrence?.rule).toBe('FREQ=MONTHLY;COUNT=12')
    })
  })

  describe('UpdateReminder', () => {
    it('updates message', async () => {
      const r = await createUc.execute({
        message: 'Old message',
        date: new Date('2025-09-01'),
        alarm: false,
      })
      const updated = await updateUc.execute(r.id, { message: 'New message' })
      expect(updated.message).toBe('New message')
    })
  })

  describe('DeleteReminder', () => {
    it('removes reminder from store', async () => {
      const r = await createUc.execute({
        message: 'Delete me',
        date: new Date('2025-09-01'),
        alarm: false,
      })
      await deleteUc.execute(r.id)
      expect(await repo.findById(r.id)).toBeNull()
    })
  })
})
