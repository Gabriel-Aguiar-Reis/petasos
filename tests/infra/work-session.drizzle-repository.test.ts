import { WorkSession } from '@/src/domain/entities/work-session'
import { DrizzleWorkSessionRepository } from '@/src/infra/repositories/work-session.drizzle-repository'
import { NotFoundError, StorageError } from '@/src/lib/errors'
import { createTestDb } from './helpers/db'

const D = (y: number, m: number, d: number, h = 0) => new Date(y, m - 1, d, h)

function makeSession(
  id: string,
  startTime: Date = D(2024, 1, 1, 8),
  endTime: Date | null = null
) {
  return WorkSession.reconstitute({ id, startTime, endTime })
}

describe('DrizzleWorkSessionRepository (integration)', () => {
  let repo: DrizzleWorkSessionRepository

  beforeEach(() => {
    repo = new DrizzleWorkSessionRepository(createTestDb())
  })

  it('create — inserts and returns the session', async () => {
    const s = makeSession('s1')
    expect(await repo.create(s)).toBe(s)
  })

  it('findById — returns the stored session', async () => {
    const start = D(2024, 1, 15, 9)
    await repo.create(makeSession('s1', start))
    const found = await repo.findById('s1')
    expect(found.id).toBe('s1')
    expect(found.startTime.getTime()).toBe(start.getTime())
    expect(found.endTime).toBeNull()
  })

  it('findById — returns session with endTime', async () => {
    const start = D(2024, 1, 1, 8)
    const end = D(2024, 1, 1, 17)
    await repo.create(makeSession('s1', start, end))
    const found = await repo.findById('s1')
    expect(found.endTime!.getTime()).toBe(end.getTime())
  })

  it('findById — throws NotFoundError when not found', async () => {
    await expect(repo.findById('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('findAll — returns all sessions', async () => {
    await repo.create(makeSession('s1'))
    await repo.create(makeSession('s2'))
    expect(await repo.findAll()).toHaveLength(2)
  })

  it('findAll — returns empty array', async () => {
    expect(await repo.findAll()).toEqual([])
  })

  it('findActive — returns session with null endTime', async () => {
    await repo.create(makeSession('s1', D(2024, 1, 1), D(2024, 1, 1, 17)))
    await repo.create(makeSession('s2'))
    const active = await repo.findActive()
    expect(active?.id).toBe('s2')
  })

  it('findActive — returns null when no active session', async () => {
    await repo.create(makeSession('s1', D(2024, 1, 1), D(2024, 1, 1, 17)))
    expect(await repo.findActive()).toBeNull()
  })

  it('findActive — returns null when repository is empty', async () => {
    expect(await repo.findActive()).toBeNull()
  })

  it('update — persists endTime', async () => {
    const end = D(2024, 1, 1, 18)
    await repo.create(makeSession('s1'))
    const updated = makeSession('s1', D(2024, 1, 1, 8), end)
    await repo.update(updated)
    const fetched = await repo.findById('s1')
    expect(fetched.endTime!.getTime()).toBe(end.getTime())
  })

  it('update — throws NotFoundError when not found', async () => {
    await expect(repo.update(makeSession('ghost'))).rejects.toBeInstanceOf(
      NotFoundError
    )
  })

  it('delete — removes the session', async () => {
    await repo.create(makeSession('s1'))
    await repo.delete('s1')
    await expect(repo.findById('s1')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('delete — throws NotFoundError when not found', async () => {
    await expect(repo.delete('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('create — throws StorageError on duplicate primary key', async () => {
    await repo.create(makeSession('s1'))
    await expect(repo.create(makeSession('s1'))).rejects.toBeInstanceOf(
      StorageError
    )
  })
})
