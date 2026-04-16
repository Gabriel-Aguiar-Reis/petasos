import { Button } from '@/src/components/ui/button'
import { Text } from '@/src/components/ui/text'
import { View } from 'react-native'

type EmptyStateProps = {
  title: string
  description: string
  action?: {
    label: string
    onPress: () => void
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-12">
      <Text className="text-center text-lg font-semibold text-foreground">
        {title}
      </Text>
      <Text className="text-center text-sm text-muted-foreground">
        {description}
      </Text>
      {action ? (
        <Button label={action.label} onPress={action.onPress} className="mt-2" />
      ) : null}
    </View>
  )
}
