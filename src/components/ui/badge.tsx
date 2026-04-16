import { cn } from '@/src/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { View } from 'react-native'
import { Text } from './text'

const badgeVariants = cva('rounded-full px-2 py-0.5 self-start', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-muted',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const badgeTextVariants = cva('text-xs font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type BadgeProps = VariantProps<typeof badgeVariants> & {
  label: string
  className?: string
}

export function Badge({ label, variant, className }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      <Text className={badgeTextVariants({ variant })}>{label}</Text>
    </View>
  )
}
