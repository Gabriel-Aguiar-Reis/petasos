import '@/global.css'
import { initializeDatabase } from '@/src/infra/db/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { useColorScheme, View } from 'react-native'

const queryClient = new QueryClient()

export default function RootLayout() {
  const colorScheme = useColorScheme()

  useEffect(() => {
    initializeDatabase()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <View
        className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}
        style={{ flex: 1 }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: '#ffffff' },
            headerTintColor: '#111827',
            headerTitleStyle: { fontWeight: '600' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="work-sessions"
            options={{ headerShown: true, title: 'Sessões de Trabalho' }}
          />
          <Stack.Screen
            name="goals"
            options={{ headerShown: true, title: 'Metas' }}
          />
          <Stack.Screen
            name="export"
            options={{ headerShown: true, title: 'Exportar Dados' }}
          />
        </Stack>
      </View>
    </QueryClientProvider>
  )
}
