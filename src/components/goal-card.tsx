import { useGoalProgress } from '@/src/application/hooks/use-goals'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Progress } from '@/src/components/ui/progress'
import { Text } from '@/src/components/ui/text'
import type { Goal } from '@/src/domain/entities/goal'
import { formatCurrency } from '@/src/lib/format'
import { Trash2 } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

const GOAL_TYPE_LABELS: Record<string, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
}

type GoalCardProps = {
  goal: Goal
  onDelete: () => void
}

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const { data: progressList } = useGoalProgress()
  const progress = progressList?.find((p) => p.goal.id === goal.id)

  const achieved = progress?.actualEarnings ?? 0
  const percent =
    goal.targetAmount > 0
      ? Math.min(100, Math.round((achieved / goal.targetAmount) * 100))
      : 0
  const remaining = progress?.remainingAmount ?? goal.targetAmount
  const isAchieved = progress?.achieved ?? false

  return (
    <Card className="mb-3">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-foreground">
            Meta {GOAL_TYPE_LABELS[goal.type]} —{' '}
            {formatCurrency(goal.targetAmount)}
          </Text>
          {isAchieved ? (
            <Text className="text-xs font-bold text-primary">✓ Atingida</Text>
          ) : null}
        </View>
      </CardHeader>
      <CardContent>
        <Progress value={percent} className="mb-2" />
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted-foreground">
            {formatCurrency(achieved)} alcançado
          </Text>
          <Text className="text-sm text-muted-foreground">
            {formatCurrency(remaining)} restante
          </Text>
        </View>
        <View className="flex-row mt-3">
          <Pressable
            onPress={onDelete}
            className="flex-row items-center gap-1 min-h-[44px] pr-3"
            hitSlop={8}
          >
            <Trash2 size={16} color="#ef4444" />
            <Text className="text-sm text-destructive">Excluir</Text>
          </Pressable>
        </View>
      </CardContent>
    </Card>
  )
}
