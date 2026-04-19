import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Text } from '@/src/components/ui/text'
import type { Trip } from '@/src/domain/entities/trip'
import { formatCurrency } from '@/src/lib/format'
import { Pencil, Trash2 } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

type TripCardProps = {
  trip: Trip
  onEdit: () => void
  onDelete: () => void
}

export function TripCard({ trip, onEdit, onDelete }: TripCardProps) {
  return (
    <Card className="mb-3">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <Badge variant="default">
            <Text>{trip.platform}</Text>
          </Badge>
          <Text className="text-sm text-muted-foreground">
            {trip.date.toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </CardHeader>
      <CardContent>
        <Text className="text-xl font-bold text-foreground">
          {formatCurrency(trip.earnings)}
        </Text>
        {trip.distance != null ? (
          <Text className="text-sm text-muted-foreground mt-1">
            {trip.distance} km
          </Text>
        ) : null}
        {trip.origin || trip.destination ? (
          <Text className="text-sm text-muted-foreground mt-1" numberOfLines={1}>
            {[trip.origin, trip.destination].filter(Boolean).join(' → ')}
          </Text>
        ) : null}
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
