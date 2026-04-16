import { User } from '@/src/domain/entities/user'

describe('User entity', () => {
  it('reconstitute creates a user from stored props', () => {
    const createdAt = new Date(2024, 0, 1)
    const user = User.reconstitute({ id: '1', name: 'Gabriel', createdAt })
    expect(user.id).toBe('1')
    expect(user.name).toBe('Gabriel')
    expect(user.createdAt).toBe(createdAt)
  })
})
