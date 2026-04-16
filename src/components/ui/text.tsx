import { cn } from '@/src/lib/utils'
import { Text as RNText, type TextProps } from 'react-native'

type Props = TextProps & {
  className?: string
}

export function Text({ className, ...props }: Props) {
  return (
    <RNText className={cn('text-foreground text-base', className)} {...props} />
  )
}
