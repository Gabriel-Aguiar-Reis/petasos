import notifee, {
  AndroidForegroundServiceType,
  AndroidImportance,
} from '@notifee/react-native'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const CHANNEL_ID = 'work-session'

let ongoingNotificationId: string | null = null

// Registra o foreground service runner exigido pelo Notifee.
// O callback recebe a notificação que está sendo exibida.
notifee.registerForegroundService(() => {
  // Retorna uma Promise que nunca resolve — o serviço permanece ativo
  // até ser explicitamente parado com stopForegroundService().
  return new Promise(() => {})
})

export async function initializeNotifications() {
  try {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Sessão de Trabalho',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [300, 300],
      })
    }

    // Solicita permissão de notificações (Android 13+)
    const perms = await Notifications.getPermissionsAsync()
    if (perms.status !== 'granted') {
      await Notifications.requestPermissionsAsync()
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('initializeNotifications error', e)
  }
}

export async function showOngoingNotification() {
  try {
    if (ongoingNotificationId) return ongoingNotificationId

    const id = await notifee.displayNotification({
      title: 'Sessão de trabalho ativa',
      body: 'Sua sessão de trabalho está em andamento — toque para abrir o app.',
      data: { type: 'work-session' },
      android: {
        channelId: CHANNEL_ID,
        ongoing: true,
        autoCancel: false,
        asForegroundService: true,
        foregroundServiceTypes: [
          AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SHORT_SERVICE,
        ],
        progress: {
          indeterminate: true,
        },
        pressAction: {
          id: 'default',
        },
      },
    })
    ongoingNotificationId = id
    return id
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('showOngoingNotification error', e)
    return null
  }
}

export async function hideOngoingNotification() {
  try {
    if (!ongoingNotificationId) return
    await notifee.stopForegroundService()
    await notifee.cancelNotification(ongoingNotificationId)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('hideOngoingNotification error', e)
  }
  ongoingNotificationId = null
}

export function isOngoingNotificationShown() {
  return ongoingNotificationId !== null
}
