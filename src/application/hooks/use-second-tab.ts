import { useUserSettings } from '@/src/application/hooks/use-user-settings'
import { PremiumValidatorService } from '@/src/application/services/premium-validator.service'
import { useEffect, useState } from 'react'

export function useSecondTab(): string | null {
  const [secondTab, setSecondTab] = useState<string | null>(null)
  const { data: userSettings } = useUserSettings()

  useEffect(() => {
    let mounted = true
      ; (async () => {
        const hasPaid = await PremiumValidatorService.isPremium()
        const chosen = !hasPaid
          ? 'premium'
          : (userSettings?.starredScreen ?? 'trips')
        if (mounted) setSecondTab(chosen)
      })()
    return () => {
      mounted = false
    }
  }, [userSettings])

  return secondTab
}
