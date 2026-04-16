import { Card, CardContent } from '@/src/components/ui/card'
import { Text } from '@/src/components/ui/text'

type DashboardMetricCardProps = {
  label: string
  value: string
  sub?: string
}

export function DashboardMetricCard({
  label,
  value,
  sub,
}: DashboardMetricCardProps) {
  return (
    <Card className="flex-1">
      <CardContent>
        <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </Text>
        <Text className="text-2xl font-bold text-foreground mt-1">{value}</Text>
        {sub ? (
          <Text className="text-xs text-muted-foreground mt-0.5">{sub}</Text>
        ) : null}
      </CardContent>
    </Card>
  )
}
