import { DeleteWorkSession } from '@/src/application/use-cases/work-session/delete-work-session.use-case'
import { EndWorkSession } from '@/src/application/use-cases/work-session/end-work-session.use-case'
import { StartWorkSession } from '@/src/application/use-cases/work-session/star-work-session.use-case'
import { db } from '@/src/infra/db/client'
import { DrizzleWorkSessionRepository } from '@/src/infra/repositories/work-session.drizzle-repository'
import { useActiveSessionStore } from '@/src/lib/stores/active-session.store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const sessionRepo = new DrizzleWorkSessionRepository(db)
const startUC = new StartWorkSession(sessionRepo)
const endUC = new EndWorkSession(sessionRepo)
const deleteUC = new DeleteWorkSession(sessionRepo)

export function useWorkSessions() {
  return useQuery({
    queryKey: ['work-sessions'],
    queryFn: () => sessionRepo.findAll(),
  })
}

export function useStartWorkSession() {
  const queryClient = useQueryClient()
  const { startSession } = useActiveSessionStore()
  return useMutation({
    mutationFn: () => startUC.execute(),
    onSuccess: (session) => {
      startSession(session.id, session.startTime.getTime())
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] })
    },
  })
}

export function useEndWorkSession() {
  const queryClient = useQueryClient()
  const { endSession } = useActiveSessionStore()
  return useMutation({
    mutationFn: () => endUC.execute(),
    onSuccess: () => {
      endSession()
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] })
    },
  })
}

export function useDeleteWorkSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUC.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] })
    },
  })
}
