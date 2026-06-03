import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getPermissionStatus() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleRetentionNotification() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const existing = scheduled.find(n => n.content.data?.type === 'retention');
  if (existing) await Notifications.cancelScheduledNotificationAsync(existing.identifier);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '☕ Sentimos sua falta!',
      body: 'Seu café está esperando. Que tal um ciclo de foco hoje?',
      data: { type: 'retention' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2 * 24 * 60 * 60,
      channelId: 'pomodoro',
    },
  });
}

export async function setupChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('pomodoro', {
    name: 'Pomodoro Coffee',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E0A766',
  });
}

export async function schedulePhaseNotification(delaySeconds: number, message: string) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '☕ Pomodoro Coffee',
      body: message,
      sound: true,
    },
    trigger: {
      seconds: Math.max(1, Math.round(delaySeconds)),
      channelId: 'pomodoro',
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
