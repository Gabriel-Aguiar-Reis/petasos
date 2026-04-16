import { Tabs } from 'expo-router'
import { Car, Fuel, LayoutDashboard, Menu, Receipt } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: { borderTopColor: '#e5e7eb' },
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
