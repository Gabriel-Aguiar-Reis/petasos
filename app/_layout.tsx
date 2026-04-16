import '@/global.css'
import { initializeDatabase } from '@/src/infra/db/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as NavigationBar from 'expo-navigation-bar'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { Platform, StatusBar, useColorScheme, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const queryClient = new QueryClient()

export default function RootLayout() {
  const colorScheme = useColorScheme()

  useEffect(() => {
    initializeDatabase()
  }, [])

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
