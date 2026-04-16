import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Text } from '@/src/components/ui/text'
import type { WorkSession } from '@/src/domain/entities/work-session'
import { formatDuration } from '@/src/lib/format'
import { Trash2 } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

type WorkSessionCardProps = {
  session: WorkSession
  onDelete: () => void
}

export function WorkSessionCard({ session, onDelete }: WorkSessionCardProps) {
  const startStr = session.startTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const endStr = session.endTime
    ? session.endTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '–'
  const duration =
    session.durationMinutes != null
      ? formatDuration(session.durationMinutes)
      : '–'

  return (
    <Card className="mb-3">
      <CardHeader>
        <Text className="text-sm text-muted-foreground">
          {session.startTime.toLocaleDateString('pt-BR')}
        </Text>
      </CardHeader>
      <CardContent>
        <Text className="text-base font-semibold text-foreground">
          {startStr} → {endStr}
        </Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Duração: {duration}
        </Text>
        <View className="flex-row mt-3">
          <Pressable
            onPress={onDelete}
            className="flex-row items-center gap-1 min-h-[44px] pr-3"
            hitSlop={8}
          >
            <Trash2 size={16} color="#ef4444" />
            <Text className="text-sm text-destructive">Excluir</Text>
          </Pressable>
        </View>
      </CardContent>
    </Card>
  )
}
