import { Tabs } from 'expo-router'
import { Car, Fuel, LayoutDashboard, Menu, Receipt } from 'lucide-react-native'
import { useColorScheme } from 'react-native'

export default function TabsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'hsl(83.9 100% 40.5%)',
        tabBarInactiveTintColor: isDark
          ? 'hsl(192 8% 64.1%)'
          : 'hsl(191.4 9.2% 44.5%)',
        tabBarStyle: {
          backgroundColor: isDark ? 'hsl(200 14.1% 4.1%)' : 'hsl(0 0% 100%)',
          borderTopColor: isDark
            ? 'hsl(193.4 12.2% 15.1%)'
            : 'hsl(192 10.8% 89.9%)',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Viagens',
          tabBarIcon: ({ color }) => <Car size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="costs"
        options={{
          title: 'Custos',
          tabBarIcon: ({ color }) => <Receipt size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fuel"
        options={{
          title: 'Combustível',
          tabBarIcon: ({ color }) => <Fuel size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color }) => <Menu size={20} color={color} />,
        }}
      />
    </Tabs>
  )
}
