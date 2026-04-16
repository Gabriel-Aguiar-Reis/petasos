type UserProps = {
  id: string
  name: string
  createdAt: Date
}

export class User {
  readonly id: string
  readonly name: string
  readonly createdAt: Date

  private constructor(props: UserProps) {
    this.id = props.id
    this.name = props.name
    this.createdAt = props.createdAt
  }

  /** Reconstitute from persistence — skips validation (data is already trusted). */
  static reconstitute(props: UserProps): User {
    return new User(props)
  }
}
