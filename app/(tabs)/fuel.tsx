import {
  useDeleteFuelLog,
  useFuelEfficiency,
  useFuelLogs,
} from '@/src/application/hooks/use-fuel-logs'
import { EmptyState } from '@/src/components/empty-state'
import { FuelForm } from '@/src/components/fuel-form'
import { FuelLogCard } from '@/src/components/fuel-log-card'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Text } from '@/src/components/ui/text'
import { formatCurrency } from '@/src/lib/format'
import { useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Modal, View } from 'react-native'

export default function FuelScreen() {
  const { data: logs, isLoading, isError } = useFuelLogs()
  const { data: efficiency } = useFuelEfficiency()
  const deleteFuel = useDeleteFuelLog()
  const [showForm, setShowForm] = useState(false)

  function handleDelete(id: string) {
    Alert.alert('Excluir abastecimento', 'Deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteFuel.mutate(id),
      },
    ])
  }

  const sorted = [...(logs ?? [])].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">Combustível</Text>
        <Button
          label="Abastecer"
          onPress={() => setShowForm(true)}
          className="px-3"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : isError ? (
        <Text className="text-destructive px-4">
          Erro ao carregar registros.
        </Text>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListHeaderComponent={
            efficiency && efficiency.length > 0 ? (
              <View className="mb-4 gap-2">
                {efficiency.map((eff) => (
                  <Card key={eff.fuelType}>
                    <CardContent>
                      <Text className="text-sm font-semibold text-foreground">
                        {eff.fuelType}
                      </Text>
                      {eff.kmPerLiter != null ? (
                        <View className="flex-row gap-4 mt-1">
                          <Text className="text-sm text-muted-foreground">
                            {eff.kmPerLiter} km/L
                          </Text>
                          {eff.costPerKm != null ? (
                            <Text className="text-sm text-muted-foreground">
                              {formatCurrency(eff.costPerKm)}/km
                            </Text>
                          ) : null}
                        </View>
                      ) : (
                        <Text className="text-sm text-muted-foreground mt-1">
                          Dados insuficientes para calcular eficiência
                        </Text>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              title="Nenhum abastecimento"
              description="Toque em Abastecer para registrar seu primeiro abastecimento."
            />
          }
          renderItem={({ item }) => (
            <FuelLogCard log={item} onDelete={() => handleDelete(item.id)} />
          )}
        />
      )}

      <Modal
        visible={showForm}
        animationType="slide"
        onRequestClose={() => setShowForm(false)}
      >
        <FuelForm onClose={() => setShowForm(false)} />
      </Modal>
    </View>
  )
}
