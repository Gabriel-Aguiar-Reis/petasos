import { EndWorkSession } from '@/src/application/use-cases/work-session/end-work-session.use-case'
import { StartWorkSession } from '@/src/application/use-cases/work-session/star-work-session.use-case'
import { ConflictError } from '@/src/lib/errors'
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
})
