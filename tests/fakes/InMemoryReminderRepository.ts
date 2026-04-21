import type { Reminder } from '@/src/domain/entities/reminder'
import type { IReminderRepository } from '@/src/domain/repositories/reminder.interface.repository'

export class InMemoryReminderRepository implements IReminderRepository {
  private store: Map<string, Reminder> = new Map()

  async create(reminder: Reminder): Promise<Reminder> {
    this.store.set(reminder.id, reminder)
    return reminder
  }

  async findById(id: string): Promise<Reminder | null> {
    return this.store.get(id) ?? null
  }

  async findAll(): Promise<Reminder[]> {
    return Array.from(this.store.values())
  }

  async update(reminder: Reminder): Promise<Reminder> {
    this.store.set(reminder.id, reminder)
    return reminder
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
