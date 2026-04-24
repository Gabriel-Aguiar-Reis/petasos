import { GetUserSettings } from '@/src/application/use-cases/user-settings/get-user-settings.use-case'
import { UpdateUserSettings } from '@/src/application/use-cases/user-settings/update-user-settings.use-case'
import { UpdateUserSettingsInput } from '@/src/domain/validations/user-settings'
import { db } from '@/src/infra/db/client'
import { DrizzleUserSettingsRepository } from '@/src/infra/repositories/user-settings.drizzle-repository'
import { USE_MOCK } from '@/src/lib/config'
import { MOCK_USER_SETTINGS } from '@/src/lib/mock-data'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const userSettingsRepo = new DrizzleUserSettingsRepository(db)
const updateUC = new UpdateUserSettings(userSettingsRepo)
const getUC = new GetUserSettings(userSettingsRepo)

export function useUserSettings() {
  return useQuery({
    queryKey: ['userSettings'],
    queryFn: () =>
      USE_MOCK ? Promise.resolve(MOCK_USER_SETTINGS) : getUC.execute(),
  })
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateUserSettingsInput & { id: string }) =>
      USE_MOCK ? Promise.resolve(MOCK_USER_SETTINGS) : updateUC.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
