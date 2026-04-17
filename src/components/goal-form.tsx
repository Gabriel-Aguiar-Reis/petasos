import { useCreateGoal } from '@/src/application/hooks/use-goals'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Text } from '@/src/components/ui/text'
import type { GoalType } from '@/src/domain/entities/goal'
import { cn } from '@/src/lib/utils'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
]

type GoalFormProps = {
  onClose: () => void
}

export function GoalForm({ onClose }: GoalFormProps) {
  const [type, setType] = useState<GoalType>('daily')
  const [targetAmount, setTargetAmount] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useCreateGoal()

  function validate() {
    const next: Record<string, string> = {}
    const amount = parseFloat(targetAmount)
    if (!targetAmount || isNaN(amount) || amount <= 0) {
      next.targetAmount = 'Informe um valor válido (> 0)'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    try {
      await createMutation.mutateAsync({
        type,
        targetAmount: parseFloat(targetAmount),
        periodStart: new Date(),
      })
      onClose()
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a meta.')
    }
  }

  return (
    <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
      <Text className="text-lg font-semibold text-foreground mb-4">
        Nova Meta
      </Text>
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-sm font-medium text-foreground">Período *</Text>
          <View className="flex-row gap-2">
            {GOAL_TYPES.map((gt) => (
              <Pressable
                key={gt.value}
                onPress={() => setType(gt.value)}
                className={cn(
                  'flex-1 items-center py-2 rounded-md border min-h-[44px] justify-center',
                  type === gt.value
                    ? 'bg-primary border-primary'
                    : 'bg-card border-border'
                )}
              >
                <Text
                  className={cn(
                    'text-sm',
                    type === gt.value
                      ? 'text-primary-foreground'
                      : 'text-foreground'
                  )}
                >
                  {gt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Input
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="decimal-pad"
          placeholder="Ex: 500,00"
        />
        <View className="flex-row gap-3 mt-2">
          <Button variant="outline" onPress={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            className="flex-1"
          >
            {createMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}
