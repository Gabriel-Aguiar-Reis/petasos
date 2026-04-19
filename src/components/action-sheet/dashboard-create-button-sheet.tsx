import { DefaultActionSheet } from '@/src/components/action-sheet'
import { Button } from '@/src/components/ui/button'
import { Text } from '@/src/components/ui/text'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { SheetManager, SheetProps } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function DashboardCreateButtonSheet(
  props: SheetProps<'dashboard-create-button-sheet'>
) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <DefaultActionSheet sheetProps={props}>
      <View style={{ paddingBottom: insets.bottom }}>
        <Button
          variant="outline"
          onPress={async () => await SheetManager.hide(props.sheetId)}
          className="w-full"
        >
          <Text>Fechar</Text>
        </Button>
      </View>
    </DefaultActionSheet>
  )
}
