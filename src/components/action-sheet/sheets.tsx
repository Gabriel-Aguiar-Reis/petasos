import { SheetRegister } from 'react-native-actions-sheet'

declare module 'react-native-actions-sheet' {
  interface Sheets {
    // 'sheet-name': SheetDefinition<{
    //   payload: sheet-specific-payload-type
    // }>
    // 'sheet-name': SheetDefinition
  }
}

export const Sheets = () => {
  return <SheetRegister sheets={{}} />
}
