import { useCreateCost, useUpdateCost } from '@/src/application/hooks/use-costs'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Text } from '@/src/components/ui/text'
import type { Cost } from '@/src/domain/entities/cost'
import { cn } from '@/src/lib/utils'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'

const CATEGORIES = [
  { value: 'fuel', label: 'Combustível' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'food', label: 'Alimentação' },
  { value: 'parking_tolls', label: 'Estacion./Pedágio' },
  { value: 'custom', label: 'Outro' },
] as const

type CostFormProps = {
  cost?: Cost
  onClose: () => void
}

export function CostForm({ cost, onClose }: CostFormProps) {
  const [amount, setAmount] = useState(cost ? String(cost.amount) : '')
  const [category, setCategory] = useState(cost?.category ?? 'fuel')
  const [customLabel, setCustomLabel] = useState(
    cost && !CATEGORIES.map((c) => c.value).includes(cost.category as never)
      ? cost.category
      : ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useCreateCost()
  const updateMutation = useUpdateCost()
  const isPending = createMutation.isPending || updateMutation.isPending

  function validate() {
    const next: Record<string, string> = {}
    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      next.amount = 'Informe um valor válido (> 0)'
    }
    if (!category) {
      next.category = 'Selecione uma categoria'
    }
    if (category === 'custom' && !customLabel.trim()) {
      next.customLabel = 'Informe a descrição'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    const resolvedCategory =
      category === 'custom' ? customLabel.trim() : category
    const input = {
      amount: parseFloat(amount),
      category: resolvedCategory,
      date: cost?.date ?? new Date(),
    }
    try {
      if (cost) {
        await updateMutation.mutateAsync({ id: cost.id, ...input })
      } else {
        await createMutation.mutateAsync(input)
      }
      onClose()
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o custo.')
    }
  }

  return (
    <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
      <Text className="text-lg font-semibold text-foreground mb-4">
        {cost ? 'Editar Custo' : 'Novo Custo'}
      </Text>
      <View className="gap-4">
        <Input
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />
        <View className="gap-1">
          <Text className="text-sm font-medium text-foreground">
            Categoria *
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                className={cn(
                  'px-3 py-2 rounded-md border min-h-[44px] justify-center',
                  category === cat.value
                    ? 'bg-primary border-primary'
                    : 'bg-card border-border'
                )}
              >
                <Text
                  className={cn(
                    'text-sm',
                    category === cat.value
                      ? 'text-primary-foreground'
                      : 'text-foreground'
                  )}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.category ? (
            <Text className="text-xs text-destructive">{errors.category}</Text>
          ) : null}
        </View>
        {category === 'custom' ? (
          <Input
            value={customLabel}
            onChangeText={setCustomLabel}
            placeholder="Ex: Multa, Licenciamento..."
          />
        ) : null}
        <View className="flex-row gap-3 mt-2">
          <Button variant="outline" onPress={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onPress={handleSubmit} disabled={isPending} className="flex-1">
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}
