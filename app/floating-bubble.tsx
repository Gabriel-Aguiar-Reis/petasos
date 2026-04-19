import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Text } from '@/src/components/ui/text'
import {
  checkOverlayPermission,
  isServiceRunning,
  requestOverlayPermission,
  startFloatingService,
  stopFloatingService,
} from '@/src/lib/floating-bubble-service-bridge'
import { useEffect, useState } from 'react'
import { Alert, AppState, Platform, ScrollView, View } from 'react-native'

type BubbleStatus = 'unsupported' | 'blocked' | 'ready' | 'active'

function getStatusVariant(status: BubbleStatus) {
  switch (status) {
    case 'active':
      return 'default' as const
    case 'ready':
      return 'secondary' as const
    case 'blocked':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function getStatusLabel(status: BubbleStatus) {
  switch (status) {
    case 'active':
      return 'Ativa'
    case 'ready':
      return 'Pronta para iniciar'
    case 'blocked':
      return 'Permissão pendente'
    default:
      return 'Indisponível neste dispositivo'
  }
}

export default function FloatingBubbleScreen() {
  const isAndroid = Platform.OS === 'android'
  const [overlayGranted, setOverlayGranted] = useState(false)
  const [serviceActive, setServiceActive] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hint, setHint] = useState<string | null>(null)

  const status: BubbleStatus = !isAndroid
    ? 'unsupported'
    : serviceActive
      ? 'active'
      : overlayGranted
        ? 'ready'
        : 'blocked'

  async function refreshStatus() {
    if (!isAndroid) {
      setOverlayGranted(false)
      setServiceActive(false)
      return { hasOverlay: false, running: false }
    }

    try {
      setIsRefreshing(true)
      const [hasOverlay, running] = await Promise.all([
        checkOverlayPermission(),
        isServiceRunning(),
      ])
      setOverlayGranted(hasOverlay)
      setServiceActive(running)
      return { hasOverlay, running }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível consultar o estado da bubble.')
      return { hasOverlay: false, running: false }
    } finally {
      setIsRefreshing(false)
    }
  }

  async function handleCheckPermission() {
    const { hasOverlay } = await refreshStatus()
    setHint(
      hasOverlay
        ? 'A permissão de overlay já está concedida.'
        : 'A permissão ainda não foi concedida. Toque em Pedir Permissão.'
    )
  }

  async function handleRequestPermission() {
    try {
      await requestOverlayPermission()
      setHint(
        'As configurações do Android foram abertas. Conceda a permissão e volte para atualizar o status.'
      )
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir as configurações de overlay.')
    }
  }

  async function handleStartBubble() {
    if (!overlayGranted) {
      setHint('Conceda a permissão de overlay antes de iniciar a bubble.')
      return
    }

    try {
      const started = await startFloatingService()
      await refreshStatus()

      if (started) {
        setHint(
          'Bubble iniciada. Toque no círculo flutuante para abrir o acesso rápido do Petasos.'
        )
      } else {
        setHint('A bubble não foi iniciada. Verifique a permissão de overlay.')
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar a bubble.')
    }
  }

  async function handleStopBubble() {
    try {
      await stopFloatingService()
      await refreshStatus()
      setHint('Bubble parada com sucesso.')
    } catch {
      Alert.alert('Erro', 'Não foi possível parar a bubble.')
    }
  }

  useEffect(() => {
    void refreshStatus()

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshStatus()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      style={{ padding: 16 }}
    >
      <Text className="text-2xl font-bold text-foreground mb-2">
        Bubble Flutuante
      </Text>
      <Text className="text-sm text-muted-foreground mb-6">
        Ative uma bubble no estilo chat head para abrir o atalho rápido do
        Petasos por cima de outros apps.
      </Text>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Status atual</CardTitle>
          <CardDescription>
            A bubble precisa da permissão de overlay para aparecer sobre outros
            apps.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <Badge variant={getStatusVariant(status)}>
            <Text>{getStatusLabel(status)}</Text>
          </Badge>
          <Text className="text-sm text-muted-foreground">
            Permissão de overlay: {overlayGranted ? 'concedida' : 'pendente'}
          </Text>
          <Text className="text-sm text-muted-foreground">
            Serviço da bubble: {serviceActive ? 'em execução' : 'parado'}
          </Text>
          {hint ? <Text className="text-sm text-foreground">{hint}</Text> : null}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
          <CardDescription>
            Depois de iniciar a bubble, toque nela para abrir o atalho rápido e
            entrar em Trip ou Cost sem refazer o fluxo do app.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-2">
          <Text className="text-sm text-muted-foreground">
            1. Verifique a permissão de overlay.
          </Text>
          <Text className="text-sm text-muted-foreground">
            2. Toque em Pedir Permissão caso o Android ainda não tenha liberado.
          </Text>
          <Text className="text-sm text-muted-foreground">
            3. Inicie a bubble e toque no círculo flutuante para abrir o acesso
            rápido.
          </Text>
        </CardContent>
      </Card>

      <View className="gap-3 pb-8">
        <Button
          onPress={handleCheckPermission}
          disabled={isRefreshing || !isAndroid}
        >
          <Text>
            {isRefreshing ? 'Atualizando...' : 'Verificar Permissão de Overlay'}
          </Text>
        </Button>
        <Button
          variant="outline"
          onPress={handleRequestPermission}
          disabled={!isAndroid}
        >
          <Text>Pedir Permissão</Text>
        </Button>
        <Button
          onPress={handleStartBubble}
          disabled={!isAndroid || !overlayGranted}
        >
          <Text>Iniciar Bubble</Text>
        </Button>
        <Button
          variant="destructive"
          onPress={handleStopBubble}
          disabled={!isAndroid || !serviceActive}
        >
          <Text>Parar Bubble</Text>
        </Button>
      </View>
    </ScrollView>
  )
}
