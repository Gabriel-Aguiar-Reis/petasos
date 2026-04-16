import { cn } from '@/src/lib/utils'
import { View, type ViewProps } from 'react-native'
import { Text } from './text'

type CardProps = ViewProps & { className?: string }

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-lg border border-border bg-card p-4', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <View className={cn('mb-2', className)} {...props} />
}

type CardTitleProps = { children: React.ReactNode; className?: string }

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <Text
      className={cn('text-base font-semibold text-card-foreground', className)}
    >
      {children}
    </Text>
  )
}

export function CardContent({ className, ...props }: CardProps) {
  return <View className={cn('', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <View className={cn('mt-2 flex-row items-center', className)} {...props} />
  )
}
