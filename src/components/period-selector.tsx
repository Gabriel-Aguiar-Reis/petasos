import { Text } from '@/src/components/ui/text'
import { cn } from '@/src/lib/utils'
import { Pressable, View } from 'react-native'

type Period = 'today' | 'week' | 'month'

const OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
]

type PeriodSelectorProps = {
  value: Period
  onChange: (value: Period) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <View className="flex-row rounded-lg border border-border overflow-hidden">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={cn(
              'flex-1 items-center justify-center min-h-[44px] px-2',
              isActive ? 'bg-primary' : 'bg-card'
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
