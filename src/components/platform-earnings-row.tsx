import { Text } from '@/src/components/ui/text'
import { formatCurrency } from '@/src/lib/format'
import { View } from 'react-native'

type PlatformEarningsRowProps = {
  platform: string
  earnings: number
}

export function PlatformEarningsRow({
  platform,
  earnings,
}: PlatformEarningsRowProps) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-border">
      <Text className="text-sm font-medium text-foreground">{platform}</Text>
      <Text className="text-sm font-semibold text-foreground">
        {formatCurrency(earnings)}
      </Text>
    </View>
  )
}
