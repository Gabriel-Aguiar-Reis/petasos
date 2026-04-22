export const SchedulableTriggerInputTypes = {
  DATE: 'date' as const,
}

export const scheduleNotificationAsync = jest
  .fn()
  .mockResolvedValue('mock-notification-id')
