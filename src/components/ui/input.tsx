import { cn } from '@/src/lib/utils'
import { TextInput, type TextInputProps, View } from 'react-native'
import { Text } from './text'

type InputProps = TextInputProps & {
  label?: string
  error?: string
  className?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="gap-1">
      {label ? (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      ) : null}
      <TextInput
        className={cn(
          'min-h-[44px] rounded-md border border-border bg-card px-3 py-2 text-base text-foreground',
          error && 'border-destructive',
          className
        )}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
    </View>
  )
}
