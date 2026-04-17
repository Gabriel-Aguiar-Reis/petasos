import { useDashboardSummary } from '@/src/application/hooks/use-dashboard-summary'
import { Text } from '@/src/components/ui/text'
import { formatCurrency } from '@/src/lib/format'
import { View } from 'react-native'
import { DashboardMetricCard } from './dashboard-metric-card'
import { PlatformEarningsRow } from './platform-earnings-row'

export function DashboardMetrics({
  data,
}: {
  data: NonNullable<ReturnType<typeof useDashboardSummary>['data']>
}) {
  return (
    <View className="mt-4 gap-3">
      <View className="flex-row gap-3">
        <DashboardMetricCard
          label="Ganhos"
          value={formatCurrency(data.totalEarnings)}
        />
        <DashboardMetricCard
          label="Custos"
          value={formatCurrency(data.totalCosts)}
        />
      </View>
      <DashboardMetricCard
        label="Lucro Líquido"
        value={formatCurrency(data.netProfit)}
        sub={
          data.costPerKm != null
            ? `${formatCurrency(data.costPerKm)}/km`
            : undefined
        }
      />
      {data.earningsByPlatform.length > 0 && (
        <View className="mt-2">
          <Text className="text-base font-semibold text-foreground mb-2">
            Por plataforma
          </Text>
          {data.earningsByPlatform.map((row) => (
            <PlatformEarningsRow
              key={row.platform}
              platform={row.platform}
              earnings={row.earnings}
            />
          ))}
        </View>
      )}
    </View>
  )
}
