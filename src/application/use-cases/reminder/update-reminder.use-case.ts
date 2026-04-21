import type { Reminder } from '@/src/domain/entities/reminder'
import type { IReminderRepository } from '@/src/domain/repositories/reminder.interface.repository'
import type { UpdateReminderInput } from '@/src/domain/validations/reminder'
import { NotFoundError } from '@/src/lib/errors'

export class UpdateReminder {
  constructor(private readonly repo: IReminderRepository) {}

  async execute(id: string, input: UpdateReminderInput): Promise<Reminder> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('Reminder', id)
    const updated = existing.update(input)
    return this.repo.update(updated)
  }
}
