import type { Reminder } from '../entities/reminder'

export interface IReminderRepository {
  create(reminder: Reminder): Promise<Reminder>
  findById(id: string): Promise<Reminder | null>
  findAll(): Promise<Reminder[]>
  update(reminder: Reminder): Promise<Reminder>
  delete(id: string): Promise<void>
}
