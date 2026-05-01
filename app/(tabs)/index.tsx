import { useDashboardSummary } from '@/src/application/hooks/use-dashboard-summary'
import { DashboardMetrics } from '@/src/components/dashboard-metrics'
import { EmptyState } from '@/src/components/empty-state'
import { QuickEntryOverlay } from '@/src/components/quick-entry-overlay'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/src/components/ui/tabs'
import { Text } from '@/src/components/ui/text'
import { getDateRange } from '@/src/lib/getters'
import { Period } from '@/src/types/dashboard-summary.types'
import { useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export const OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
]

export default function HomeScreen() {
  const [period, setPeriod] = useState<Period>('today')
  const dateRange = getDateRange(period)
  const { data, isLoading, isError } = useDashboardSummary(dateRange)

  const isEmpty =
    !data ||
    (data.totalEarnings === 0 &&
      data.totalCosts === 0 &&
      data.earningsByPlatform.length === 0)

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator className="mt-8" />
      </SafeAreaView>
    )
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-destructive mt-4">
          Erro ao carregar dados. Tente novamente.
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-foreground mb-4">
          Tela Inicial
        </Text>
        <Tabs
          value={period}
          onValueChange={(val) => setPeriod(val as Period)}
          className="w-full"
        >
          <TabsList className="rounded-lg border border-card overflow-hidden bg-card">
            {OPTIONS.map((opt) => (
              <TabsTrigger
                key={opt.value}
                value={opt.value}
                className="flex-1 items-center justify-center min-h-[44px] px-2"
              >
                <Text className="text-sm font-medium">{opt.label}</Text>
              </TabsTrigger>
            ))}
          </TabsList>

          {OPTIONS.map((opt) => (
            <TabsContent key={opt.value} value={opt.value}>
              {isEmpty ? (
                <View className="mt-4">
                  <EmptyState
                    title="Nenhum dado ainda"
                    description="Registre sua primeira viagem ou custo para ver o resumo aqui."
                  />
                </View>
              ) : (
                <DashboardMetrics data={data} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </ScrollView>
      <QuickEntryOverlay />
    </SafeAreaView>
  )
}
