import { Text } from '@/src/components/ui/text'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'

type ActiveSessionTimerProps = {
  startedAt: number // Unix ms
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function ActiveSessionTimer({ startedAt }: ActiveSessionTimerProps) {
  const [elapsed, setElapsed] = useState(
    Math.floor((Date.now() - startedAt) / 1000)
  )
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    ref.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => {
      if (ref.current) clearInterval(ref.current)
    }
  }, [startedAt])

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60

  return (
    <View className="items-center py-4">
      <Text className="text-4xl font-mono font-bold text-foreground">
        {pad(h)}:{pad(m)}:{pad(s)}
      </Text>
      <Text className="text-sm text-muted-foreground mt-1">Sessão ativa</Text>
    </View>
  )
}
