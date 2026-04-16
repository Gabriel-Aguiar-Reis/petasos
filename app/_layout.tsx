import '@/global.css'
import { db } from '@/src/infra/db/client'
import migrations from '@/src/infra/db/migrations/migrations'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import * as NavigationBar from 'expo-navigation-bar'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native'
import 'react-native-get-random-values'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const queryClient = new QueryClient()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { success: dbReady } = useMigrations(db, migrations)

  useEffect(() => {
    StatusBar.setBarStyle(
      colorScheme === 'dark' ? 'light-content' : 'dark-content'
    )
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(
        colorScheme === 'dark' ? '#020817' : '#ffffff'
      )
      NavigationBar.setStyle(colorScheme === 'dark' ? 'dark' : 'light')
    }
  }, [colorScheme])

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View
          className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}
          style={{ flex: 1 }}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              headerTintColor: `${colorScheme === 'dark' ? '#ffffff' : '#000000'}`,
              headerStyle: {
                backgroundColor: `${colorScheme === 'dark' ? '#020817' : '#ffffff'}`,
              },
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
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
