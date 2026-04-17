import {
  useDeleteWorkSession,
  useEndWorkSession,
  useStartWorkSession,
  useWorkSessions,
} from '@/src/application/hooks/use-work-sessions'
import { ActiveSessionTimer } from '@/src/components/active-session-timer'
import { EmptyState } from '@/src/components/empty-state'
import { Button } from '@/src/components/ui/button'
import { Text } from '@/src/components/ui/text'
import { WorkSessionCard } from '@/src/components/work-session-card'
import { useActiveSessionStore } from '@/src/lib/stores/active-session.store'
import { useEffect } from 'react'
import { ActivityIndicator, Alert, FlatList, View } from 'react-native'

export default function WorkSessionsScreen() {
  const { data: sessions, isLoading, isError } = useWorkSessions()
  const { activeSessionId, startedAt, startSession } = useActiveSessionStore()
  const startMutation = useStartWorkSession()
  const endMutation = useEndWorkSession()
  const deleteMutation = useDeleteWorkSession()

  // Re-hydrate active session on mount
  useEffect(() => {
    if (!activeSessionId && sessions) {
      const active = sessions.find((s) => s.endTime === null)
      if (active) {
        startSession(active.id, active.startTime.getTime())
      }
    }
    // Only run on sessions load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions])

  function handleDelete(id: string) {
    Alert.alert('Excluir sessão', 'Deseja excluir esta sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(id),
      },
    ])
  }

  const completed = [...(sessions ?? [])]
    .filter((s) => s.endTime !== null)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground">
          Sessões de Trabalho
        </Text>
      </View>

      <View className="px-4 pb-4">
        {activeSessionId && startedAt ? (
          <View className="gap-3">
            <ActiveSessionTimer startedAt={startedAt} />
            <Button
              variant="destructive"
              onPress={() => endMutation.mutate()}
              disabled={endMutation.isPending}
            >
              {endMutation.isPending ? 'Encerrando...' : 'Encerrar Sessão'}
            </Button>
          </View>
        ) : (
          <Button
            onPress={() => startMutation.mutate()}
            disabled={startMutation.isPending}
          >
            {startMutation.isPending ? 'Iniciando...' : 'Iniciar Sessão'}
          </Button>
        )}
        {startMutation.isError || endMutation.isError ? (
          <Text className="text-destructive text-sm mt-2">
            Erro ao atualizar sessão. Tente novamente.
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator />
      ) : isError ? (
        <Text className="text-destructive px-4">Erro ao carregar sessões.</Text>
      ) : (
        <FlatList
          data={completed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListEmptyComponent={
            <EmptyState
              title="Nenhuma sessão concluída"
              description="Inicie e encerre uma sessão para ver o histórico."
            />
          }
          renderItem={({ item }) => (
            <WorkSessionCard
              session={item}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}
    </View>
  )
}
