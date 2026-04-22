import { Reminder } from '@/src/domain/entities/reminder'
import type { IReminderRepository } from '@/src/domain/repositories/reminder.interface.repository'
import type { CreateReminderInput } from '@/src/domain/validations/reminder'
import * as Notifications from 'expo-notifications'
import { v4 as uuidv4 } from 'uuid'

export class CreateReminder {
  constructor(private readonly repo: IReminderRepository) {}

  async execute(input: CreateReminderInput): Promise<Reminder> {
    const reminder = Reminder.create({ id: uuidv4(), ...input })
    await this.repo.create(reminder)

    if (reminder.alarm) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete',
          body: reminder.message,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminder.date,
        },
      })
    }

    return reminder
  }
}
