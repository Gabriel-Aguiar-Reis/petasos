const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** Currency formatter for Brazilian Real (BRL) (e.g., "R$ 1.000,00") */
export function formatCurrency(value: number): string {
  return brlFormatter.format(value)
}

/** Duration formatter: Converts minutes into a human-readable format (e.g., "1h 30min") */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}
