import { useExportData } from '@/src/application/hooks/use-export'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Text } from '@/src/components/ui/text'
import { Share2 } from 'lucide-react-native'
import { useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'

export default function ExportScreen() {
  const exportMutation = useExportData()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [dateError, setDateError] = useState('')

  function validateDates(): boolean {
    if (!fromDate && !toDate) return true
    const from = fromDate ? new Date(fromDate) : null
    const to = toDate ? new Date(toDate) : null
    if ((from && isNaN(from.getTime())) || (to && isNaN(to.getTime()))) {
      setDateError('Use o formato AAAA-MM-DD')
      return false
    }
    if (from && to && from > to) {
      setDateError('A data inicial deve ser anterior à data final')
      return false
    }
    setDateError('')
    return true
  }

  async function handleExport() {
    if (!validateDates()) return
    try {
      await exportMutation.mutateAsync()
    } catch {
      Alert.alert('Erro', 'Não foi possível exportar os dados.')
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16 }}
    >
      <Text className="text-2xl font-bold text-foreground mb-2">
        Exportar Dados
      </Text>
      <Text className="text-sm text-muted-foreground mb-6">
        Exporte todos os seus dados como um arquivo JSON compatível com qualquer
        planilha ou sistema de backup.
      </Text>

      <View className="gap-4 mb-6">
        <Text className="text-base font-semibold text-foreground">
          Filtro por data (opcional)
        </Text>
        <Input
          label="Data inicial (AAAA-MM-DD)"
          value={fromDate}
          onChangeText={setFromDate}
          placeholder="Ex: 2026-01-01"
          error={dateError || undefined}
        />
        <Input
          label="Data final (AAAA-MM-DD)"
          value={toDate}
          onChangeText={setToDate}
          placeholder="Ex: 2026-12-31"
        />
      </View>

      <Button
        label={exportMutation.isPending ? 'Exportando...' : 'Exportar JSON'}
        onPress={handleExport}
        disabled={exportMutation.isPending}
      />

      {exportMutation.isError ? (
        <Text className="text-destructive text-sm mt-3">
          Erro ao exportar. Verifique se tem espaço em disco e tente novamente.
        </Text>
      ) : null}

      <View className="flex-row items-center gap-2 mt-8">
        <Share2 size={16} color="#6b7280" />
        <Text className="text-xs text-muted-foreground">
          O arquivo será compartilhado via a planilha nativa do dispositivo.
        </Text>
      </View>
    </ScrollView>
  )
}
