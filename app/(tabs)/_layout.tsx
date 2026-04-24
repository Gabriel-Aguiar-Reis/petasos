import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'
import { Tabs } from 'expo-router'
import { Car, LayoutDashboard, Menu, Plus, Receipt } from 'lucide-react-native'
import { useColorScheme, useWindowDimensions, View } from 'react-native'
import { SheetManager } from 'react-native-actions-sheet'

export default function TabsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { width: windowWidth } = useWindowDimensions()
  const TAB_BAR_WIDTH = 290
  const BUTTON_SIZE = 48
  const SAFE_EDGE = 16
  const tabBarLeft = Math.max((windowWidth - TAB_BAR_WIDTH) / 2, SAFE_EDGE)
  const fabLeft = tabBarLeft + TAB_BAR_WIDTH + 12
  const isOverflowing = fabLeft + BUTTON_SIZE > windowWidth - SAFE_EDGE

  const openCreateSheet = async () => {
    await SheetManager.show('create-action-sheet')
  }

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'hsl(83.9 100% 40.5%)',
          tabBarInactiveTintColor: isDark
            ? 'hsl(192 8% 64.1%)'
            : 'hsl(191.4 9.2% 44.5%)',
          tabBarStyle: {
            backgroundColor: isDark ? 'hsl(197.2 12.9% 10%)' : 'hsl(0 0% 100%)',
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            borderRadius: 16,
            height: 64,
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 16,
            marginHorizontal: 16,
            marginVertical: 8,
            paddingTop: 4,
            width: TAB_BAR_WIDTH,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <LayoutDashboard size={20} color={color} />
            ),
            animation: 'shift',
          }}
        />
        <Tabs.Screen
          name="trips"
          options={{
            title: 'Viagens',
            tabBarIcon: ({ color }) => <Car size={20} color={color} />,
            animation: 'shift',
          }}
        />
        <Tabs.Screen
          name="costs"
          options={{
            title: 'Custos',
            tabBarIcon: ({ color }) => <Receipt size={20} color={color} />,
            animation: 'shift',
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'Mais',
            tabBarIcon: ({ color }) => <Menu size={20} color={color} />,
            animation: 'shift',
          }}
        />
      </Tabs>
      <Button
        className={cn(
          'absolute bottom-7 z-20 size-14 rounded-full',
          isOverflowing ? 'right-6' : ''
        )}
        size="icon"
        style={isOverflowing ? undefined : { left: fabLeft }}
        onPress={() => openCreateSheet()}
      >
        <Plus size={28} />
      </Button>
    </View>
  )
}
