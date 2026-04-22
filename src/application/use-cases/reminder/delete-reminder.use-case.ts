import type { IReminderRepository } from '@/src/domain/repositories/reminder.interface.repository'

export class DeleteReminder {
  constructor(private readonly repo: IReminderRepository) {}

  async execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
