import { useDashboardSummary } from '@/src/application/hooks/use-dashboard-summary'
import { DashboardMetricCard } from '@/src/components/dashboard-metric-card'
import { EmptyState } from '@/src/components/empty-state'
import { FloatingActionButton } from '@/src/components/floating-action-button'
import { PeriodSelector } from '@/src/components/period-selector'
import { PlatformEarningsRow } from '@/src/components/platform-earnings-row'
import { QuickEntryOverlay } from '@/src/components/quick-entry-overlay'
import { Text } from '@/src/components/ui/text'
import { formatCurrency } from '@/src/lib/format'
import { useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Period = 'today' | 'week' | 'month'

function getDateRange(period: Period): { from: Date; to: Date } {
  const now = new Date()
  const from = new Date(now)
  const to = new Date(now)

  if (period === 'today') {
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else if (period === 'week') {
    const day = now.getDay()
    from.setDate(now.getDate() - day)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else {
    from.setDate(1)
    from.setHours(0, 0, 0, 0)
    to.setMonth(to.getMonth() + 1, 0)
    to.setHours(23, 59, 59, 999)
  }

  return { from, to }
}

export default function DashboardScreen() {
  const [period, setPeriod] = useState<Period>('today')
  const dateRange = getDateRange(period)
  const { data, isLoading, isError } = useDashboardSummary(dateRange)

  const isEmpty =
    !data ||
    (data.totalEarnings === 0 &&
      data.totalCosts === 0 &&
      data.earningsByPlatform.length === 0)

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-foreground mb-4">
          Dashboard
        </Text>
        <PeriodSelector value={period} onChange={setPeriod} />

        {isLoading ? (
          <ActivityIndicator className="mt-8" />
        ) : isError ? (
          <Text className="text-destructive mt-4">
            Erro ao carregar dados. Tente novamente.
          </Text>
        ) : isEmpty ? (
          <EmptyState
            title="Nenhum dado ainda"
            description="Registre sua primeira viagem ou custo para ver o resumo aqui."
          />
        ) : (
          <>
            <View className="flex-row gap-3 mt-4">
              <DashboardMetricCard
                label="Ganhos"
                value={formatCurrency(data.totalEarnings)}
              />
              <DashboardMetricCard
                label="Custos"
                value={formatCurrency(data.totalCosts)}
              />
            </View>
            <View className="mt-3">
              <DashboardMetricCard
                label="Lucro Líquido"
                value={formatCurrency(data.netProfit)}
                sub={
                  data.costPerKm != null
                    ? `${formatCurrency(data.costPerKm)}/km`
                    : undefined
                }
              />
            </View>
            {data.earningsByPlatform.length > 0 ? (
              <View className="mt-6">
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
            ) : null}
          </>
        )}
      </ScrollView>
      <FloatingActionButton onPress={() => {}} />
      <QuickEntryOverlay />
    </SafeAreaView>
  )
}
