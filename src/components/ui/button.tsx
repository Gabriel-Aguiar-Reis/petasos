import { cn } from '@/src/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Pressable, type PressableProps } from 'react-native'
import { Text } from './text'

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md min-h-[44px] px-4',
  {
    variants: {
      variant: {
        default: 'bg-primary active:opacity-80',
        destructive: 'bg-destructive active:opacity-80',
        outline: 'border border-border active:opacity-80',
        ghost: 'active:opacity-60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const textVariants = cva('font-medium text-sm', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    label: string
    className?: string
    textClassName?: string
    disabled?: boolean
  }

export function Button({
  label,
  variant,
  className,
  textClassName,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant }),
        disabled && 'opacity-50',
        className
      )}
      disabled={disabled}
      {...props}
    >
      <Text className={cn(textVariants({ variant }), textClassName)}>
        {label}
      </Text>
    </Pressable>
  )
}
