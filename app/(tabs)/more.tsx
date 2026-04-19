import { Text } from '@/src/components/ui/text'
import { useRouter } from 'expo-router'
import { ChevronRight, Clock, Share2, Target } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type MenuRowProps = {
  label: string
  icon: React.ReactNode
  onPress: () => void
}

function MenuRow({ label, icon, onPress }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3 bg-card border-b border-border min-h-[56px]"
    >
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="text-base text-foreground">{label}</Text>
      </View>
      <ChevronRight size={20} color="#6b7280" />
    </Pressable>
  )
}

export default function MoreScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground">Mais</Text>
      </View>
      <View className="mt-2 rounded-lg overflow-hidden border border-border mx-4">
        <MenuRow
          label="Sessões de Trabalho"
          icon={<Clock size={20} color="#6b7280" />}
          onPress={() => router.push('/work-sessions')}
        />
        <MenuRow
          label="Metas"
          icon={<Target size={20} color="#6b7280" />}
          onPress={() => router.push('/goals')}
        />
        <MenuRow
          label="Exportar Dados"
          icon={<Share2 size={20} color="#6b7280" />}
          onPress={() => router.push('/export')}
        />
        <MenuRow
          label="Bubble Flutuante"
          icon={
            <View className="h-5 w-5 rounded-full border-2 border-primary" />
          }
          onPress={() => router.push('../floating-bubble')}
        />
      </View>
    </SafeAreaView>
  )
}
