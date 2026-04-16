import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Text } from '@/src/components/ui/text'
import type { FuelLog } from '@/src/domain/entities/fuel-log'
import { formatCurrency } from '@/src/lib/format'
import { Droplets, Trash2 } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

type FuelLogCardProps = {
  log: FuelLog
  onDelete: () => void
}

export function FuelLogCard({ log, onDelete }: FuelLogCardProps) {
  return (
    <Card className="mb-3">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Droplets size={16} color="#6b7280" />
            <Badge label={log.fuelType} variant="secondary" />
          </View>
          <Text className="text-sm text-muted-foreground">
            {log.date.toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </CardHeader>
      <CardContent>
        <Text className="text-xl font-bold text-foreground">
          {formatCurrency(log.totalPrice)}
        </Text>
        <Text className="text-sm text-muted-foreground mt-1">
          {log.liters} L · {formatCurrency(log.pricePerLiter)}/L
        </Text>
        <Text className="text-sm text-muted-foreground">
          Hodômetro: {log.odometer} km
        </Text>
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
