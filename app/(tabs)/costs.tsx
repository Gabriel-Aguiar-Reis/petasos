import { useCosts, useDeleteCost } from '@/src/application/hooks/use-costs'
import { CostCard } from '@/src/components/cost-card'
import { CostForm } from '@/src/components/cost-form'
import { EmptyState } from '@/src/components/empty-state'
import { QuickEntryOverlay } from '@/src/components/quick-entry-overlay'
import { Text } from '@/src/components/ui/text'
import type { Cost } from '@/src/domain/entities/cost'
import { useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Modal, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function CostsScreen() {
  const { data: costs, isLoading, isError } = useCosts()
  const deleteCost = useDeleteCost()
  const [editingCost, setEditingCost] = useState<Cost | null>(null)

  function handleDelete(cost: Cost) {
    Alert.alert('Excluir custo', 'Deseja excluir este custo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteCost.mutate(cost.id),
      },
    ])
  }

  const sorted = [...(costs ?? [])].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground">Custos</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : isError ? (
        <Text className="text-destructive px-4">Erro ao carregar custos.</Text>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={
            <EmptyState
              title="Nenhum custo"
              description="Use o botão + para registrar um custo."
            />
          }
          renderItem={({ item }) => (
            <CostCard
              cost={item}
              onEdit={() => setEditingCost(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}
      <QuickEntryOverlay />

      <Modal
        visible={editingCost !== null}
        animationType="slide"
        onRequestClose={() => setEditingCost(null)}
      >
        {editingCost ? (
          <CostForm cost={editingCost} onClose={() => setEditingCost(null)} />
        ) : null}
      </Modal>
    </SafeAreaView>
  )
}
