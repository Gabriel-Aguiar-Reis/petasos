import { HolidaySyncService } from '@/src/application/services/holiday-sync.service'
import { StorageError } from '@/src/lib/errors'
import { SpecialDay } from '@/src/domain/entities/special-day'

describe('HolidaySyncService', () => {
  const YEAR = 2023

  afterEach(() => {
    ;(global as any).fetch = undefined
  })

  it('returns zero on network error', async () => {
    ;(global as any).fetch = jest.fn().mockRejectedValue(new Error('net'))
    const repo = { upsertOfficial: jest.fn() }
    const svc = new HolidaySyncService(repo as any)
    const res = await svc.syncYear(YEAR)
    expect(res).toEqual({ synced: 0, skipped: 0 })
  })

  it('returns zero when response not ok', async () => {
    ;(global as any).fetch = jest.fn().mockResolvedValue({ ok: false })
    const repo = { upsertOfficial: jest.fn() }
    const svc = new HolidaySyncService(repo as any)
    const res = await svc.syncYear(YEAR)
    expect(res).toEqual({ synced: 0, skipped: 0 })
  })

  it('syncs holidays and counts skipped on StorageError', async () => {
    const holidays = [
      { date: '2023-01-01', name: 'A', type: 'X' },
      { date: '2023-01-02', name: 'B', type: 'Y' },
    ]
    ;(global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => holidays })

    let calls = 0
    const repo = {
      upsertOfficial: jest.fn().mockImplementation(() => {
        calls++
        if (calls === 1) throw new StorageError('fail')
        return Promise.resolve()
      }),
    }
    const svc = new HolidaySyncService(repo as any)
    const res = await svc.syncYear(YEAR)
    expect(res.synced).toBe(1)
    expect(res.skipped).toBe(1)
  })

  it('rethrows non StorageError', async () => {
    const holidays = [{ date: '2023-01-01', name: 'A', type: 'X' }]
    ;(global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => holidays })
    const repo = { upsertOfficial: jest.fn().mockImplementation(() => { throw new Error('boom') }) }
    const svc = new HolidaySyncService(repo as any)
    await expect(svc.syncYear(YEAR)).rejects.toThrow('boom')
  })
})
