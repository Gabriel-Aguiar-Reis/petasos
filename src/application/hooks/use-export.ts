import { ExportDataAsJSON } from '@/src/application/use-cases/export-data-as-json.use-case'
import { db } from '@/src/infra/db/client'
import { DrizzleCostRepository } from '@/src/infra/repositories/cost.drizzle-repository'
import { DrizzleFuelLogRepository } from '@/src/infra/repositories/fuel-log.drizzle-repository'
import { DrizzleGoalRepository } from '@/src/infra/repositories/goal.drizzle-repository'
import { DrizzleTripRepository } from '@/src/infra/repositories/trip.drizzle-repository'
import { DrizzleWorkSessionRepository } from '@/src/infra/repositories/work-session.drizzle-repository'
import { useMutation } from '@tanstack/react-query'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'

const tripRepo = new DrizzleTripRepository(db)
const costRepo = new DrizzleCostRepository(db)
const fuelRepo = new DrizzleFuelLogRepository(db)
const sessionRepo = new DrizzleWorkSessionRepository(db)
const goalRepo = new DrizzleGoalRepository(db)
const exportUC = new ExportDataAsJSON(
  tripRepo,
  costRepo,
  fuelRepo,
  sessionRepo,
  goalRepo
)

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const envelope = await exportUC.execute()
      const json = JSON.stringify(envelope, null, 2)
      const timestamp = Date.now()
      const file = new File(Paths.cache, `roadledger-export-${timestamp}.json`)
      file.write(json)
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json' })
    },
  })
}
