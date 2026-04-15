export const FUEL_TYPES = ['Gasolina', 'Etanol', 'Diesel', 'GNV'] as const

export type KnownFuelType = (typeof FUEL_TYPES)[number]
