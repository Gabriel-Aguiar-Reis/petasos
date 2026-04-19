import { DeleteWorkSession } from '@/src/application/use-cases/work-session/delete-work-session.use-case'
import { EndWorkSession } from '@/src/application/use-cases/work-session/end-work-session.use-case'
import { StartWorkSession } from '@/src/application/use-cases/work-session/star-work-session.use-case'
import { db } from '@/src/infra/db/client'
import { DrizzleWorkSessionRepository } from '@/src/infra/repositories/work-session.drizzle-repository'
import { USE_MOCK } from '@/src/lib/config'
import { MOCK_WORK_SESSIONS } from '@/src/lib/mock-data'
import {
  hideOngoingNotification,
  showOngoingNotification,
} from '@/src/lib/notifications'
import { useActiveSessionStore } from '@/src/lib/stores/active-session.store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const sessionRepo = new DrizzleWorkSessionRepository(db)
const startUC = new StartWorkSession(sessionRepo)
const endUC = new EndWorkSession(sessionRepo)
const deleteUC = new DeleteWorkSession(sessionRepo)

export function useWorkSessions() {
  return useQuery({
    queryKey: ['work-sessions'],
    queryFn: () =>
      USE_MOCK ? Promise.resolve(MOCK_WORK_SESSIONS) : sessionRepo.findAll(),
  })
}

export function useStartWorkSession() {
  const queryClient = useQueryClient()
  const { startSession } = useActiveSessionStore()
  return useMutation({
    mutationFn: () =>
      USE_MOCK ? Promise.resolve(MOCK_WORK_SESSIONS[2]) : startUC.execute(),
    onSuccess: (session) => {
      startSession(session.id, session.startTime.getTime())
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] })
      // Exibir notificação contínua enquanto a sessão estiver ativa
      void showOngoingNotification()
        .then((id) => {
          // eslint-disable-next-line no-console
          console.log('showOngoingNotification id', id)
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.log('showOngoingNotification error', e)
        })
    },
  })
}

export function useEndWorkSession() {
  const queryClient = useQueryClient()
  const { endSession } = useActiveSessionStore()
  return useMutation({
    mutationFn: () =>
      USE_MOCK ? Promise.resolve(MOCK_WORK_SESSIONS[0]) : endUC.execute(),
    onSuccess: () => {
      endSession()
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] })
      // Remover notificação quando a sessão terminar
      void hideOngoingNotification()
    },
  })
}

export function useDeleteWorkSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK ? Promise.resolve() : deleteUC.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] })
    },
  })
}
