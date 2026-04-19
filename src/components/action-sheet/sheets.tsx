import { DashboardCreateButtonSheet } from '@/src/components/action-sheet/dashboard-create-button-sheet'
import { registerSheet, SheetDefinition } from 'react-native-actions-sheet'

registerSheet('dashboard-create-button-sheet', DashboardCreateButtonSheet)

declare module 'react-native-actions-sheet' {
  interface Sheets {
    // 'sheet-name': SheetDefinition<{
    //   payload: sheet-specific-payload-type
    // }>
    'dashboard-create-button-sheet': SheetDefinition
  }
}
