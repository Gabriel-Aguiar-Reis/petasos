import { useCreateFuelLog } from '@/src/application/hooks/use-fuel-logs'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Text } from '@/src/components/ui/text'
import { cn } from '@/src/lib/utils'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'

const FUEL_TYPES = ['Gasolina', 'Etanol', 'Diesel', 'GNV']

type FuelFormProps = {
  onClose: () => void
}

export function FuelForm({ onClose }: FuelFormProps) {
  const [fuelType, setFuelType] = useState(FUEL_TYPES[0])
  const [customFuel, setCustomFuel] = useState('')
  const [liters, setLiters] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [odometer, setOdometer] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useCreateFuelLog()

  function validate() {
    const next: Record<string, string> = {}
    if (isNaN(parseFloat(liters)) || parseFloat(liters) <= 0) {
      next.liters = 'Informe litros válidos (> 0)'
    }
    if (isNaN(parseFloat(totalPrice)) || parseFloat(totalPrice) <= 0) {
      next.totalPrice = 'Informe um valor válido (> 0)'
    }
    if (isNaN(parseFloat(odometer)) || parseFloat(odometer) < 0) {
      next.odometer = 'Informe o hodômetro (≥ 0)'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const resolvedType =
      FUEL_TYPES.includes(fuelType) && fuelType !== 'Outro'
        ? fuelType
        : customFuel.trim() || fuelType
    try {
      await createMutation.mutateAsync({
        fuelType: resolvedType,
        liters: parseFloat(liters),
        totalPrice: parseFloat(totalPrice),
        odometer: parseFloat(odometer),
      })
      onClose()
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o abastecimento.')
    }
  }

  return (
    <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
      <Text className="text-lg font-semibold text-foreground mb-4">
        Novo Abastecimento
      </Text>
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-sm font-medium text-foreground">
            Combustível *
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FUEL_TYPES.map((ft) => (
              <Pressable
                key={ft}
                onPress={() => setFuelType(ft)}
                className={cn(
                  'px-3 py-2 rounded-md border min-h-[44px] justify-center',
                  fuelType === ft
                    ? 'bg-primary border-primary'
                    : 'bg-card border-border'
                )}
              >
                <Text
                  className={cn(
                    'text-sm',
                    fuelType === ft
                      ? 'text-primary-foreground'
                      : 'text-foreground'
                  )}
                >
                  {ft}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {!FUEL_TYPES.includes(fuelType) || fuelType === 'Outro' ? (
          <Input
            label="Tipo de combustível"
            value={customFuel}
            onChangeText={setCustomFuel}
            placeholder="Ex: Gasolina Aditivada"
          />
        ) : null}
        <Input
          label="Litros *"
          value={liters}
          onChangeText={setLiters}
          keyboardType="decimal-pad"
          error={errors.liters}
          placeholder="Ex: 40.5"
        />
        <Input
          label="Valor total (R$) *"
          value={totalPrice}
          onChangeText={setTotalPrice}
          keyboardType="decimal-pad"
          error={errors.totalPrice}
          placeholder="0,00"
        />
        <Input
          label="Hodômetro (km) *"
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="decimal-pad"
          error={errors.odometer}
          placeholder="Ex: 45230"
        />
        <View className="flex-row gap-3 mt-2">
          <Button
            label="Cancelar"
            variant="outline"
            onPress={onClose}
            className="flex-1"
          />
          <Button
            label={createMutation.isPending ? 'Salvando...' : 'Salvar'}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            className="flex-1"
          />
        </View>
      </View>
    </ScrollView>
  )
}
