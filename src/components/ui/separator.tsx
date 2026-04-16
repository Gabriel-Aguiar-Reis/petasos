import { cn } from '@/src/lib/utils'
import { View } from 'react-native'

type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Separator({
  orientation = 'horizontal',
  className,
}: SeparatorProps) {
  return (
    <View
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
    />
  )
}
