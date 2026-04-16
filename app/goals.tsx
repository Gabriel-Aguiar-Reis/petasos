import { useDeleteGoal, useGoals } from '@/src/application/hooks/use-goals'
import { EmptyState } from '@/src/components/empty-state'
import { GoalCard } from '@/src/components/goal-card'
import { GoalForm } from '@/src/components/goal-form'
import { Button } from '@/src/components/ui/button'
import { Text } from '@/src/components/ui/text'
import { useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Modal, View } from 'react-native'

export default function GoalsScreen() {
  const { data: goals, isLoading, isError } = useGoals()
  const deleteGoal = useDeleteGoal()
  const [showForm, setShowForm] = useState(false)

  function handleDelete(id: string) {
    Alert.alert('Excluir meta', 'Deseja excluir esta meta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteGoal.mutate(id),
      },
    ])
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">Metas</Text>
        <Button
          label="Nova Meta"
          onPress={() => setShowForm(true)}
          className="px-3"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : isError ? (
        <Text className="text-destructive px-4">Erro ao carregar metas.</Text>
      ) : (
        <FlatList
          data={goals ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={
            <EmptyState
              title="Nenhuma meta"
              description="Crie sua primeira meta de ganhos para acompanhar o progresso."
            />
          }
          renderItem={({ item }) => (
            <GoalCard goal={item} onDelete={() => handleDelete(item.id)} />
          )}
        />
      )}

      <Modal
        visible={showForm}
        animationType="slide"
        onRequestClose={() => setShowForm(false)}
      >
        <GoalForm onClose={() => setShowForm(false)} />
      </Modal>
    </View>
  )
}
