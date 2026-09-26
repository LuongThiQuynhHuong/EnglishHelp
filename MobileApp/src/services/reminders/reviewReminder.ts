import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import i18n from '@/i18n';
import type { Settings } from '@/models/Settings';
import { localNotifications as Notifications } from './localNotifications';

const REMINDER_KIND = 'dailyReviewReminder';
const CHANNEL_ID = 'daily-review-reminder';
const hasCustomChannel = () => Platform.OS === 'android' && !isRunningInExpoGo();

Notifications.setNotificationHandler({
  handleNotification: async (notification) => ({
    shouldShowBanner: notification.request.content.data?.kind === REMINDER_KIND,
    shouldShowList: notification.request.content.data?.kind === REMINDER_KIND,
    shouldPlaySound: notification.request.content.data?.kind === REMINDER_KIND,
    shouldSetBadge: false,
  }),
});

async function ensureChannel(): Promise<void> {
  if (hasCustomChannel()) {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: i18n.t('settings.reviewReminder'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestReminderPermission(): Promise<boolean> {
  await ensureChannel(); // Native Android builds need a channel before the permission prompt.
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

let pending: Promise<void> = Promise.resolve();

// Serialize startup, setting edits, and logout so an older request cannot restore a stale alarm.
export function syncReviewReminder(userId: string | null, settings: Pick<Settings, 'reviewReminder' | 'reminderTime'> | null): Promise<void> {
  const next = pending.catch(() => undefined).then(() => syncNow(userId, settings));
  pending = next;
  return next;
}

async function syncNow(userId: string | null, settings: Pick<Settings, 'reviewReminder' | 'reminderTime'> | null): Promise<void> {
  const scheduled = (await Notifications.getAllScheduledNotificationsAsync()).filter(
    (request) => request.content.data?.kind === REMINDER_KIND,
  );
  const enabled = !!userId && !!settings?.reviewReminder && (await Notifications.getPermissionsAsync()).granted;
  const matching = enabled ? scheduled.find((request) => request.content.data?.userId === userId && request.content.data?.time === settings.reminderTime) : undefined;

  for (const request of scheduled) {
    if (request.identifier !== matching?.identifier) await Notifications.cancelScheduledNotificationAsync(request.identifier);
  }
  if (!enabled || matching || !settings || !userId) return;

  const [hour, minute] = settings.reminderTime.split(':').map(Number);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) throw new Error('invalidReminderTime');
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('app.name', { lng: 'en' }),
      body: i18n.t('settings.reminderBody', { lng: 'en' }),
      data: { kind: REMINDER_KIND, userId, time: settings.reminderTime },
      sound: 'default',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, ...(hasCustomChannel() ? { channelId: CHANNEL_ID } : {}) },
  });
}
