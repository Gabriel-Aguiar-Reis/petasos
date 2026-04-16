import * as ProgressPrimitive from '@rn-primitives/progress'

type ProgressProps = {
  value: number // 0–100
  className?: string
}

export function Progress({ value, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <ProgressPrimitive.Root
      value={clamped}
      className={`h-2 w-full overflow-hidden rounded-full bg-muted ${className ?? ''}`}
    >
      <ProgressPrimitive.Indicator
        style={{ width: `${clamped}%` }}
        className="h-full bg-primary"
      />
    </ProgressPrimitive.Root>
  )
}
