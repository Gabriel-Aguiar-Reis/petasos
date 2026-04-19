import '@/global.css'
import { db } from '@/src/infra/db/client'
import migrations from '@/src/infra/db/migrations/migrations'
import { PortalHost } from '@rn-primitives/portal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import * as NavigationBar from 'expo-navigation-bar'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native'
import 'react-native-get-random-values'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const queryClient = new QueryClient()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { success: dbReady } = useMigrations(db, migrations)
  const isDark = colorScheme === 'dark'

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content')
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(
        isDark ? 'hsl(200 14.1% 4.1%)' : 'hsl(0 0% 100%)'
      )
      NavigationBar.setStyle(isDark ? 'dark' : 'light')
    }
  }, [isDark])

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <PortalHost />
        <View className={`flex-1 ${isDark ? 'dark' : ''}`} style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              headerTintColor: isDark
                ? 'hsl(180 19.5% 98.1%)'
                : 'hsl(200 14.1% 4.1%)',
              headerStyle: {
                backgroundColor: isDark
                  ? 'hsl(200 14.1% 4.1%)'
                  : 'hsl(0 0% 100%)',
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
            <Stack.Screen
              name="floating-bubble"
              options={{ headerShown: true, title: 'Bubble Flutuante' }}
            />
            <Stack.Screen
              name="bubble-entry"
              options={{ headerShown: true, title: 'Acesso Rápido' }}
            />
          </Stack>
          {!dbReady && (
            <View
              style={[
                StyleSheet.absoluteFill,
                styles.loadingOverlay,
                {
                  backgroundColor: isDark
                    ? 'hsl(200 14.1% 4.1%)'
                    : 'hsl(0 0% 100%)',
                },
              ]}
            >
              <ActivityIndicator />
            </View>
          )}
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
