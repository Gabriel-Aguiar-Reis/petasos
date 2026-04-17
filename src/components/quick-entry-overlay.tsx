import { useCreateCost } from '@/src/application/hooks/use-costs'
import { useCreateTrip } from '@/src/application/hooks/use-trips'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Text } from '@/src/components/ui/text'
import { useQuickEntryStore } from '@/src/lib/stores/quick-entry.store'
import { useState } from 'react'
import { Alert, Modal, Pressable, View } from 'react-native'
import { CostForm } from './cost-form'
import { TripForm } from './trip-form'

export function QuickEntryOverlay() {
  const { isOpen, entryType, close } = useQuickEntryStore()
  const [expanded, setExpanded] = useState(false)

  // Quick-entry state for trips
  const [earnings, setEarnings] = useState('')
  const [platform, setPlatform] = useState('')
  const [earningsError, setEarningsError] = useState('')
  const [platformError, setPlatformError] = useState('')
  const createTrip = useCreateTrip()
  const createCost = useCreateCost()

  function handleClose() {
    setExpanded(false)
    setEarnings('')
    setPlatform('')
    setEarningsError('')
    setPlatformError('')
    close()
  }

  async function handleQuickSave() {
    let valid = true
    if (!earnings || isNaN(parseFloat(earnings)) || parseFloat(earnings) < 0) {
      setEarningsError('Informe um valor válido')
      valid = false
    } else {
      setEarningsError('')
    }
    if (!platform.trim()) {
      setPlatformError('Informe a plataforma')
      valid = false
    } else {
      setPlatformError('')
    }
    if (!valid) return
    try {
      await createTrip.mutateAsync({
        earnings: parseFloat(earnings),
        platform: platform.trim(),
      })
      handleClose()
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a viagem.')
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={handleClose} />
      <View className="bg-card rounded-t-2xl p-4 max-h-[90%]">
        {expanded ? (
          entryType === 'trip' ? (
            <TripForm onClose={handleClose} />
          ) : (
            <CostForm onClose={handleClose} />
          )
        ) : (
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">
              Nova Viagem (Rápida)
            </Text>
            <Input
              value={earnings}
              onChangeText={setEarnings}
              keyboardType="decimal-pad"
              placeholder="0,00"
              autoFocus
            />
            <Input
              value={platform}
              onChangeText={setPlatform}
              placeholder="Ex: Uber, 99"
            />
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                onPress={() => setExpanded(true)}
                className="flex-1"
              >
                Mais Detalhes
              </Button>
              <Button
                onPress={handleQuickSave}
                disabled={createTrip.isPending}
                className="flex-1"
              >
                {createTrip.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}
