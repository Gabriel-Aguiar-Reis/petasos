import { initializeDatabase } from '@/src/infra/db/client'
import { Stack } from 'expo-router'
import { useEffect } from 'react'

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase()
  }, [])

  return <Stack />
}
