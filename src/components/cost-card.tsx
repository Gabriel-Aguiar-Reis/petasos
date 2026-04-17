import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Text } from '@/src/components/ui/text'
import type { Cost } from '@/src/domain/entities/cost'
import { formatCurrency } from '@/src/lib/format'
import { Pencil, Trash2 } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

const CATEGORY_LABELS: Record<string, string> = {
  fuel: 'Combustível',
  maintenance: 'Manutenção',
  food: 'Alimentação',
  parking_tolls: 'Estacionamento/Pedágio',
  custom: 'Outro',
}

type CostCardProps = {
  cost: Cost
  onEdit: () => void
  onDelete: () => void
}

export function CostCard({ cost, onEdit, onDelete }: CostCardProps) {
  const categoryLabel = CATEGORY_LABELS[cost.category] ?? cost.category

  return (
    <Card className="mb-3">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <Badge variant="secondary">{categoryLabel}</Badge>
          <Text className="text-sm text-muted-foreground">
            {cost.date.toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </CardHeader>
      <CardContent>
        <Text className="text-xl font-bold text-foreground">
          {formatCurrency(cost.amount)}
        </Text>
        <View className="flex-row gap-3 mt-3">
          <Pressable
            onPress={onEdit}
            className="flex-row items-center gap-1 min-h-[44px] pr-3"
            hitSlop={8}
          >
            <Pencil size={16} color="#6b7280" />
            <Text className="text-sm text-muted-foreground">Editar</Text>
          </Pressable>
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
