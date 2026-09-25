// The package entry also starts push-token registration, which throws in Android Expo Go.
// Import only the local notification modules used by reminders.
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

export const localNotifications = {
  setNotificationHandler,
  setNotificationChannelAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  getAllScheduledNotificationsAsync,
  cancelScheduledNotificationAsync,
  scheduleNotificationAsync,
  AndroidImportance,
  SchedulableTriggerInputTypes,
};
