import { useDeleteTrip, useTrips } from '@/src/application/hooks/use-trips'
import { EmptyState } from '@/src/components/empty-state'
import { QuickEntryFAB } from '@/src/components/quick-entry-fab'
import { QuickEntryOverlay } from '@/src/components/quick-entry-overlay'
import { TripCard } from '@/src/components/trip-card'
import { TripForm } from '@/src/components/trip-form'
import { Text } from '@/src/components/ui/text'
import type { Trip } from '@/src/domain/entities/trip'
import { useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Modal, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function TripsScreen() {
  const { data: trips, isLoading, isError } = useTrips()
  const deleteTrip = useDeleteTrip()
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)

  function handleDelete(trip: Trip) {
    Alert.alert('Excluir viagem', 'Deseja excluir esta viagem?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteTrip.mutate(trip.id),
      },
    ])
  }

  const sorted = [...(trips ?? [])].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground">Viagens</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : isError ? (
        <Text className="text-destructive px-4">Erro ao carregar viagens.</Text>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={
            <EmptyState
              title="Nenhuma viagem"
              description="Use o botão + para registrar sua primeira viagem."
            />
          }
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onEdit={() => setEditingTrip(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <QuickEntryFAB />
      <QuickEntryOverlay />

      <Modal
        visible={editingTrip !== null}
        animationType="slide"
        onRequestClose={() => setEditingTrip(null)}
      >
        {editingTrip ? (
          <TripForm trip={editingTrip} onClose={() => setEditingTrip(null)} />
        ) : null}
      </Modal>
    </SafeAreaView>
  )
}
