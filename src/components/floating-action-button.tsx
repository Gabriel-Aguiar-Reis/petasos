import { Button } from '@/src/components/ui/button'
import { Plus } from 'lucide-react-native'

export function FloatingActionButton({ onPress }: { onPress: () => void }) {
  return (
    <Button
      onPress={onPress}
      style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      }}
    >
      <Plus size={24} color="#fff" />
    </Button>
  )
}
