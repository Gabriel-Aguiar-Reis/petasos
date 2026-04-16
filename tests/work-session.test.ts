import { DeleteWorkSession } from '@/src/application/use-cases/work-session/delete-work-session.use-case'
import { EndWorkSession } from '@/src/application/use-cases/work-session/end-work-session.use-case'
import { StartWorkSession } from '@/src/application/use-cases/work-session/star-work-session.use-case'
import { WorkSession } from '@/src/domain/entities/work-session'
import { ConflictError, NotFoundError } from '@/src/lib/errors'
import { InMemoryWorkSessionRepository } from '@/tests/fakes/InMemoryWorkSessionRepository'

describe('WorkSession use cases', () => {
  let repo: InMemoryWorkSessionRepository

  beforeEach(() => {
    repo = new InMemoryWorkSessionRepository()
  })

  it('starts a new session', async () => {
    const startUc = new StartWorkSession(repo)
    const session = await startUc.execute()
    expect(session.id).toBeTruthy()
    expect(session.endTime).toBeNull()
  })

  it('throws ConflictError when a session is already active', async () => {
    const startUc = new StartWorkSession(repo)
    await startUc.execute()
    await expect(startUc.execute()).rejects.toBeInstanceOf(ConflictError)
  })

  it('ends an active session', async () => {
    const startUc = new StartWorkSession(repo)
    await startUc.execute()

    const endUc = new EndWorkSession(repo)
    const ended = await endUc.execute()
    expect(ended.endTime).toBeInstanceOf(Date)
  })

  it('throws ConflictError when no session is active', async () => {
    const endUc = new EndWorkSession(repo)
    await expect(endUc.execute()).rejects.toBeInstanceOf(ConflictError)
  })

  describe('DeleteWorkSession', () => {
    it('deletes an existing session', async () => {
      const startUc = new StartWorkSession(repo)
      const session = await startUc.execute()
      const deleteUc = new DeleteWorkSession(repo)
      await expect(deleteUc.execute(session.id)).resolves.toBeUndefined()
    })

    it('throws NotFoundError when session does not exist', async () => {
      const uc = new DeleteWorkSession(repo)
      await expect(uc.execute('ghost')).rejects.toBeInstanceOf(NotFoundError)
    })
  })
})

describe('WorkSession entity', () => {
  it('durationMinutes is null while session is active', () => {
    const session = WorkSession.reconstitute({
      id: '1',
      startTime: new Date(),
      endTime: null,
    })
    expect(session.isActive).toBe(true)
    expect(session.durationMinutes).toBeNull()
  })

  it('durationMinutes returns elapsed minutes when ended', () => {
    const start = new Date('2024-01-01T08:00:00Z')
    const end = new Date('2024-01-01T09:30:00Z')
    const session = WorkSession.reconstitute({
      id: '1',
      startTime: start,
      endTime: end,
    })
    expect(session.durationMinutes).toBe(90)
  })

  it('end() throws ConflictError on an already ended session', () => {
    const session = WorkSession.reconstitute({
      id: '1',
      startTime: new Date('2024-01-01T08:00:00Z'),
      endTime: new Date('2024-01-01T09:00:00Z'),
    })
    expect(() => session.end()).toThrow(ConflictError)
  })
})

describe('InMemoryWorkSessionRepository', () => {
  let repo: InMemoryWorkSessionRepository

  beforeEach(() => {
    repo = new InMemoryWorkSessionRepository()
  })

  it('findAll returns all stored sessions', async () => {
    const startUc = new StartWorkSession(repo)
    await startUc.execute()
    const all = await repo.findAll()
    expect(all).toHaveLength(1)
  })

  it('update persists changes', async () => {
    const startUc = new StartWorkSession(repo)
    const session = await startUc.execute()
    const ended = session.end(new Date('2024-01-01T10:00:00Z'))
    await repo.update(ended)
    const found = await repo.findById(session.id)
    expect(found.isActive).toBe(false)
  })

  it('delete throws NotFoundError on missing session', async () => {
    await expect(repo.delete('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })
})
