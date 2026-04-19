import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent } from '@/src/components/ui/card'
import { Text } from '@/src/components/ui/text'
import { View } from 'react-native'

type DashboardMetricCardProps = {
  label: string
  value: string
  sub?: string
  badgeVariant?:
    | 'default'
    | 'destructive'
    | 'secondary'
    | 'outline'
    | null
    | undefined
}

export function DashboardMetricCard({
  label,
  value,
  sub,
  badgeVariant = 'default',
}: DashboardMetricCardProps) {
  return (
    <Card className="flex-1">
      <CardContent>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </Text>
          <Badge variant={badgeVariant} className="w-4 h-2" />
        </View>
        <Text className="text-2xl font-bold text-foreground mt-1">
          {badgeVariant === 'destructive' ? '- ' : ''}
          {value}
        </Text>
        {sub ? (
          <Text className="text-xs text-muted-foreground mt-0.5">{sub}</Text>
        ) : null}
      </CardContent>
    </Card>
  )
}
