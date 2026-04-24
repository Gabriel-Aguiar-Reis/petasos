import { CreateActionSheet } from '@/src/components/action-sheet/create-action-sheet'
import { SheetDefinition, SheetRegister } from 'react-native-actions-sheet'

declare module 'react-native-actions-sheet' {
  interface Sheets {
    // 'sheet-name': SheetDefinition<{
    //   payload: sheet-specific-payload-type
    // }>
    'create-action-sheet': SheetDefinition
  }
}

export const Sheets = () => {
  return <SheetRegister sheets={{ 'create-action-sheet': CreateActionSheet }} />
}
