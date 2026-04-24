import { Bell, Car, CreditCard, Fuel, Tag, Toolbox } from 'lucide-react-native'
import { JSX } from 'react'

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

/**
 * Returns the label for a given route.
 * @param route The route name.
 * @returns The label for the route.
 */
export function labelFor(route: string) {
  return (
    (
      {
        costs: 'Custos',
        profits: 'Lucros',
        maintenance: 'Manutenção',
        reminders: 'Lembretes',
        trips: 'Viagens',
        fuel: 'Combustível',
      } as Record<string, string>
    )[route] ?? 'Favorito'
  )
}

/**
 * Returns the icon component for a given route and color.
 * @param route The route name.
 * @param color The color for the icon.
 * @returns The icon component for the route.
 */
export function iconFor(
  route: string,
  color: string,
  fallback: JSX.Element
): JSX.Element {
  switch (route) {
    case 'costs':
      return <CreditCard size={20} color={color} />
    case 'profits':
      return <Tag size={20} color={color} />
    case 'maintenance':
      return <Toolbox size={20} color={color} />
    case 'reminders':
      return <Bell size={20} color={color} />
    case 'trips':
      return <Car size={20} color={color} />
    case 'fuel':
      return <Fuel size={20} color={color} />
    default:
      return fallback
  }
}
