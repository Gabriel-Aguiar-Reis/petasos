import { Maintenance } from '@/src/domain/entities/maintenance'
import { PlannedAbsence } from '@/src/domain/entities/planned-absence'
import { Reminder } from '@/src/domain/entities/reminder'
import { SpecialDay } from '@/src/domain/entities/special-day'
import { Vehicle } from '@/src/domain/entities/vehicle'
import { ConflictError, ValidationError } from '@/src/lib/errors'

describe('Domain entities branch coverage', () => {
  it('Maintenance.update throws on invalid input', () => {
    const m = Maintenance.reconstitute({
      id: 'm1',
      vehicleId: 'v1',
      title: 't',
      estimatedCost: 10,
      trigger: { type: 'date', date: new Date('2025-01-01') },
    })
    expect(() => m.update({ estimatedCost: -5 } as any)).toThrow(ValidationError)
  })

  it('PlannedAbsence.update throws on invalid input', () => {
    const p = PlannedAbsence.reconstitute({
      id: 'p1',
      type: 'vacation',
      date: new Date('2025-01-01'),
      endDate: new Date('2025-01-10'),
    })
    // invalid workedDays type should fail validation
    expect(() => p.update({ workedDays: ['not-a-date'] as any })).toThrow(
      ValidationError
    )
  })

  it('Reminder.update validation branch and recurrence/null handling', () => {
    const r = Reminder.reconstitute({
      id: 'r1',
      message: 'm',
      date: new Date('2025-01-01'),
      alarm: true,
    })
    const updated = r.update({ notes: null })
    expect(updated.notes).toBeUndefined()
    expect(() => r.update({ date: 'invalid' as any })).toThrow(ValidationError)
  })

  it('SpecialDay.delete throws when source is official', () => {
    const sd = SpecialDay.reconstitute({
      id: 's1',
      date: new Date('2025-05-01'),
      description: 'd',
      source: 'official',
    })
    expect(() => sd.delete()).toThrow(ConflictError)
  })

  it('Vehicle displayName and update color/notes branches', () => {
    const v = Vehicle.reconstitute({
      id: 'v1',
      name: 'MyCar',
      plate: '   ',
      brand: 'B',
      model: 'M',
      year: 2020,
      fuelTypeId: 'f',
      typeId: 't',
    })
    expect(v.displayName).toBe('MyCar')
    const updated = v.update({ color: null, notes: null })
    expect(updated.color).toBeUndefined()
    expect(updated.notes).toBeUndefined()
  })

  it('Maintenance.update branches for title/estimatedCost/trigger', () => {
    const m = Maintenance.reconstitute({
      id: 'm2',
      vehicleId: 'v2',
      title: 'old',
      estimatedCost: 5,
      trigger: { type: 'date', date: new Date('2025-01-01') },
    })
    const upd = m.update({
      title: 'new',
      estimatedCost: 15,
      trigger: { type: 'mileage', mileage: 123 } as any,
    })
    expect(upd.title).toBe('new')
    expect(upd.estimatedCost).toBe(15)
    expect((upd.trigger as any).type).toBe('mileage')
  })

  it('Reminder.update branches for message/date/alarm/recurrence', () => {
    const r = Reminder.reconstitute({
      id: 'r2',
      message: 'm',
      date: new Date('2025-01-01'),
      alarm: true,
    })
    const rec = { rule: 'FREQ=DAILY', endDate: new Date('2025-12-31') }
    const upd = r.update({
      message: 'hello',
      date: new Date('2025-02-02'),
      alarm: false,
      recurrence: rec,
    })
    expect(upd.message).toBe('hello')
    expect(upd.alarm).toBe(false)
    expect(upd.recurrence).toEqual(rec)
  })

  it('Reminder.update clears recurrence when set to null', () => {
    const r = Reminder.reconstitute({
      id: 'r3',
      message: 'm',
      date: new Date('2025-01-01'),
      alarm: true,
      recurrence: { rule: 'FREQ=DAILY' },
    })
    const upd = r.update({ recurrence: null })
    expect(upd.recurrence).toBeUndefined()
  })
})
