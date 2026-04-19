import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Text } from '@/src/components/ui/text'
import { useQuickEntryStore } from '@/src/lib/stores/quick-entry.store'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function BubbleEntryScreen() {
  const router = useRouter()
  const { openTrip, openCost } = useQuickEntryStore()

  function handleTripEntry() {
    openTrip()
    router.replace('/(tabs)/trips')
  }

  function handleCostEntry() {
    openCost()
    router.replace('/(tabs)/costs')
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-foreground mb-2">
          Acesso Rápido
        </Text>
        <Text className="text-sm text-muted-foreground mb-6">
          Escolha o tipo de registro que você quer abrir. O formulário usa o
          mesmo quick-entry já existente no app.
        </Text>

        <Card>
          <CardHeader>
            <CardTitle>Entradas disponíveis</CardTitle>
            <CardDescription>
              A bubble leva você direto ao fluxo rápido sem precisar navegar
              manualmente pelas abas.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <Button onPress={handleTripEntry}>Nova Viagem</Button>
            <Button variant="outline" onPress={handleCostEntry}>
              Novo Custo
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.replace('./floating-bubble')}
            >
              Gerenciar Bubble
            </Button>
          </CardContent>
        </Card>
      </View>
    </SafeAreaView>
  )
}
