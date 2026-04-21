import { CreateFuelTypeSchema, UpdateFuelTypeSchema } from '@/src/domain/validations/fuel-type'

describe('CreateFuelTypeSchema', () => {
  it('accepts valid input', () => {
    const parsed = CreateFuelTypeSchema.parse({ name: 'Gasolina' })
    expect(parsed.name).toBe('Gasolina')
  })

  it('rejects empty name', () => {
    expect(() => CreateFuelTypeSchema.parse({ name: '' })).toThrow()
  })
})

describe('UpdateFuelTypeSchema', () => {
  it('accepts partial update', () => {
    const parsed = UpdateFuelTypeSchema.parse({ description: 'nova' })
    expect(parsed.description).toBe('nova')
  })
})
