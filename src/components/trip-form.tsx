import { useCreateTrip, useUpdateTrip } from '@/src/application/hooks/use-trips'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Text } from '@/src/components/ui/text'
import type { Trip } from '@/src/domain/entities/trip'
import { useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'

type TripFormProps = {
  trip?: Trip
  onClose: () => void
}

export function TripForm({ trip, onClose }: TripFormProps) {
  const [earnings, setEarnings] = useState(trip ? String(trip.earnings) : '')
  const [platform, setPlatform] = useState(trip?.platform ?? '')
  const [origin, setOrigin] = useState(trip?.origin ?? '')
  const [destination, setDestination] = useState(trip?.destination ?? '')
  const [distance, setDistance] = useState(
    trip?.distance != null ? String(trip.distance) : ''
  )
  const [duration, setDuration] = useState(
    trip?.duration != null ? String(trip.duration) : ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useCreateTrip()
  const updateMutation = useUpdateTrip()
  const isPending = createMutation.isPending || updateMutation.isPending

  function validate() {
    const next: Record<string, string> = {}
    const earningsNum = parseFloat(earnings)
    if (!earnings || isNaN(earningsNum) || earningsNum < 0) {
      next.earnings = 'Informe um valor válido (≥ 0)'
    }
    if (!platform.trim()) {
      next.platform = 'Informe a plataforma'
    }
    if (distance && isNaN(parseFloat(distance))) {
      next.distance = 'Distância inválida'
    }
    if (duration && isNaN(parseFloat(duration))) {
      next.duration = 'Duração inválida'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const input = {
      earnings: parseFloat(earnings),
      platform: platform.trim(),
      date: trip?.date ?? new Date(),
      origin: origin.trim() || undefined,
      destination: destination.trim() || undefined,
      distance: distance ? parseFloat(distance) : undefined,
      duration: duration ? parseFloat(duration) : undefined,
    }
    try {
      if (trip) {
        await updateMutation.mutateAsync({ id: trip.id, ...input })
      } else {
        await createMutation.mutateAsync(input)
      }
      onClose()
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a viagem.')
    }
  }

  return (
    <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
      <Text className="text-lg font-semibold text-foreground mb-4">
        {trip ? 'Editar Viagem' : 'Nova Viagem'}
      </Text>
      <View className="gap-4">
        <Input
          value={earnings}
          onChangeText={setEarnings}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />
        <Input
          value={platform}
          onChangeText={setPlatform}
          placeholder="Ex: Uber, 99, InDriver"
        />
        <Input value={origin} onChangeText={setOrigin} placeholder="Opcional" />
        <Input
          value={destination}
          onChangeText={setDestination}
          placeholder="Opcional"
        />
        <Input
          value={distance}
          onChangeText={setDistance}
          keyboardType="decimal-pad"
          placeholder="Opcional"
        />
        <Input
          value={duration}
          onChangeText={setDuration}
          keyboardType="decimal-pad"
          placeholder="Opcional"
        />
        <View className="flex-row gap-3 mt-2">
          <Button variant="outline" onPress={onClose} className="flex-1" />
          <Button
            onPress={handleSubmit}
            disabled={isPending}
            className="flex-1"
          />
        </View>
      </View>
    </ScrollView>
  )
}
