import { ConflictError } from '@/src/lib/errors'

type WorkSessionProps = {
  id: string
  startTime: Date
  endTime: Date | null
}

export class WorkSession {
  readonly id: string
  readonly startTime: Date
  readonly endTime: Date | null

  private constructor(props: WorkSessionProps) {
    this.id = props.id
    this.startTime = props.startTime
    this.endTime = props.endTime
  }

  /** Creates a brand-new active session (endTime = null). */
  static startNow(id: string): WorkSession {
    return new WorkSession({ id, startTime: new Date(), endTime: null })
  }

  /** Reconstitute from persistence — skips validation (data is already trusted). */
  static reconstitute(props: WorkSessionProps): WorkSession {
    return new WorkSession(props)
  }

  // ─── Domain behaviours ────────────────────────────────────────────────

  /** True while the session has no end time. */
  get isActive(): boolean {
    return this.endTime === null
  }

  /** Total elapsed minutes; null while the session is still active. */
  get durationMinutes(): number | null {
    if (this.endTime === null) return null
    return Math.round(
      (this.endTime.getTime() - this.startTime.getTime()) / 60_000
    )
  }

  /** Returns a new, closed WorkSession. Throws ConflictError if already ended. */
  end(at: Date = new Date()): WorkSession {
    if (!this.isActive) throw new ConflictError('Work session is already ended')
    return WorkSession.reconstitute({
      id: this.id,
      startTime: this.startTime,
      endTime: at,
    })
  }
}
