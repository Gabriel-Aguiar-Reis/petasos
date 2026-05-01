import { DefaultActionSheet } from '@/src/components/action-sheet'
import { Button } from '@/src/components/ui/button'
import { Icon } from '@/src/components/ui/icon'
import { Text } from '@/src/components/ui/text'
import {
  ArrowLeftIcon,
  CalendarMinus,
  CalendarPlus,
  Gauge,
  Target,
  Wrench,
} from 'lucide-react-native'
import { ScrollView, View } from 'react-native'
import { SheetManager, SheetProps } from 'react-native-actions-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ICON_SIZE = 22

const actions = [
  { key: 'mileage-record', label: 'Quilometragem', Icon: Gauge },
  { key: 'goal', label: 'Meta', Icon: Target },
  { key: 'maintenance', label: 'Manutenção', Icon: Wrench },
  { key: 'planned-absence', label: 'Ausência Planejada', Icon: CalendarMinus },
  { key: 'special-day', label: 'Dia Especial', Icon: CalendarPlus },
  { key: 'back', label: 'Voltar', Icon: ArrowLeftIcon },
] as const

export function MoreCreateActionSheet(props: SheetProps<'create-action-sheet'>) {
  const insets = useSafeAreaInsets()

  const handlePress = async (_key: string) => {
    await SheetManager.hide(props.sheetId)
    if (_key === 'cancel') await SheetManager.show('create-action-sheet')

    // TODO: navigate to the corresponding creation screen
  }

  return (
    <DefaultActionSheet sheetProps={props}>
      <View
        className="pb-2 pt-4 bg-card"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Text className="mb-3 text-center text-lg font-semibold">Adicionar</Text>
        <ScrollView className="max-h-96">
          {actions.map((action, index) => (
            <Button
              onPress={() => handlePress(action.key)}
              className="flex-1 justify-start bg-card border-muted border-2 mb-2 mx-4 active:bg-accent"
              variant="default"
              size="lg"
              key={action.key}
            >
              <Icon
                size={ICON_SIZE}
                className="mr-3 text-primary"
                as={action.Icon}
              />
              <Text className="text-foreground">{action.label}</Text>
            </Button>
          ))}
        </ScrollView>
      </View>
    </DefaultActionSheet>
  )
}
