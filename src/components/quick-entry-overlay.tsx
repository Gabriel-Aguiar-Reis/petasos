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

  const [earnings, setEarnings] = useState('')
  const [platform, setPlatform] = useState('')
  const [earningsError, setEarningsError] = useState('')
  const [platformError, setPlatformError] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [amountError, setAmountError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const createTrip = useCreateTrip()
  const createCost = useCreateCost()
  const isSaving =
    entryType === 'trip' ? createTrip.isPending : createCost.isPending

  function handleClose() {
    setExpanded(false)
    setEarnings('')
    setPlatform('')
    setEarningsError('')
    setPlatformError('')
    setAmount('')
    setCategory('')
    setAmountError('')
    setCategoryError('')
    close()
  }

  async function handleQuickSave() {
    if (entryType === 'trip') {
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

      return
    }

    let valid = true

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError('Informe um valor válido')
      valid = false
    } else {
      setAmountError('')
    }

    if (!category.trim()) {
      setCategoryError('Informe a categoria')
      valid = false
    } else {
      setCategoryError('')
    }

    if (!valid) return

    try {
      await createCost.mutateAsync({
        amount: parseFloat(amount),
        category: category.trim(),
        date: new Date(),
      })
      handleClose()
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o custo.')
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
              {entryType === 'trip'
                ? 'Nova Viagem (Rápida)'
                : 'Novo Custo (Rápido)'}
            </Text>
            {entryType === 'trip' ? (
              <>
                <View className="gap-1">
                  <Input
                    value={earnings}
                    onChangeText={setEarnings}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                    autoFocus
                  />
                  {earningsError ? (
                    <Text className="text-xs text-destructive">
                      {earningsError}
                    </Text>
                  ) : null}
                </View>
                <View className="gap-1">
                  <Input
                    value={platform}
                    onChangeText={setPlatform}
                    placeholder="Ex: Uber, 99"
                  />
                  {platformError ? (
                    <Text className="text-xs text-destructive">
                      {platformError}
                    </Text>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <View className="gap-1">
                  <Input
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                    autoFocus
                  />
                  {amountError ? (
                    <Text className="text-xs text-destructive">
                      {amountError}
                    </Text>
                  ) : null}
                </View>
                <View className="gap-1">
                  <Input
                    value={category}
                    onChangeText={setCategory}
                    placeholder="Ex: Combustível, Pedágio"
                  />
                  {categoryError ? (
                    <Text className="text-xs text-destructive">
                      {categoryError}
                    </Text>
                  ) : null}
                </View>
              </>
            )}
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
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}
