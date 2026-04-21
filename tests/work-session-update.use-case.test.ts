import { UpdateWorkSession } from '@/src/application/use-cases/work-session/update-work-session.use-case'
import { WorkSession } from '@/src/domain/entities/work-session'
import { NotFoundError, ValidationError } from '@/src/lib/errors'

class FakeRepo {
  public updated: any = null
  constructor(private existing: any) { }
  async findById(id: string) {
    return this.existing ?? null
  }
  async update(ws: WorkSession) {
    this.updated = ws
    return ws
  }
}

describe('UpdateWorkSession use-case', () => {
  it('throws NotFoundError when session missing', async () => {
    const repo = new FakeRepo(null)
    const uc = new UpdateWorkSession(repo as any)
    await expect(uc.execute('nope', {})).rejects.toThrow(NotFoundError)
  })

  it('throws ValidationError when start >= end', async () => {
    const existing = WorkSession.reconstitute({
      id: 's1',
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T11:00:00Z'),
    })
    const repo = new FakeRepo(existing)
    const uc = new UpdateWorkSession(repo as any)
    await expect(
      uc.execute('s1', { startTime: new Date('2023-01-01T12:00:00Z') })
    ).rejects.toThrow(ValidationError)
  })

  it('updates successfully when valid', async () => {
    const existing = WorkSession.reconstitute({
      id: 's1',
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T11:00:00Z'),
    })
    const repo = new FakeRepo(existing)
    const uc = new UpdateWorkSession(repo as any)
    const res = await uc.execute('s1', {
      endTime: new Date('2023-01-01T12:00:00Z'),
    })
    expect(res.endTime).toEqual(new Date('2023-01-01T12:00:00Z'))
    expect(repo.updated).toBeDefined()
  })
})
