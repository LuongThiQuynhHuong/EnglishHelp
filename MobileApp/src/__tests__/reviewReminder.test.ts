import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import { localNotifications as Notifications } from '@/services/reminders/localNotifications';
import { requestReminderPermission, syncReviewReminder } from '@/services/reminders/reviewReminder';

jest.mock('expo', () => ({ isRunningInExpoGo: jest.fn(() => false) }));
jest.mock('@/services/reminders/localNotifications', () => ({ localNotifications: {
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  AndroidImportance: { DEFAULT: 3 },
} }));

let scheduled: Awaited<ReturnType<typeof Notifications.getAllScheduledNotificationsAsync>>;
const originalPlatform = Platform.OS;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(isRunningInExpoGo).mockReturnValue(false);
  Object.defineProperty(Platform, 'OS', { value: originalPlatform, configurable: true });
  scheduled = [];
  jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: true } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);
  jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockImplementation(async () => scheduled);
  jest.mocked(Notifications.cancelScheduledNotificationAsync).mockImplementation(async (id) => {
    scheduled = scheduled.filter((request) => request.identifier !== id);
  });
  jest.mocked(Notifications.scheduleNotificationAsync).mockImplementation(async (input) => {
    const identifier = `reminder-${scheduled.length + 1}`;
    scheduled.push({ identifier, content: input.content, trigger: input.trigger } as unknown as typeof scheduled[number]);
    return identifier;
  });
});

it('uses the Android fallback channel in Expo Go without calling the unavailable channel manager', async () => {
  Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
  jest.mocked(isRunningInExpoGo).mockReturnValue(true);
  expect(await requestReminderPermission()).toBe(true);
  expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();

  await syncReviewReminder('user-a', { reviewReminder: true, reminderTime: '08:30' });
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
    trigger: { type: 'daily', hour: 8, minute: 30 },
  }));
  expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
});

it('creates the reminder channel in an Android native build', async () => {
  Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
  expect(await requestReminderPermission()).toBe(true);
  expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('daily-review-reminder', expect.objectContaining({ importance: 3 }));
  await syncReviewReminder('user-a', { reviewReminder: true, reminderTime: '08:30' });
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
    trigger: { type: 'daily', hour: 8, minute: 30, channelId: 'daily-review-reminder' },
  }));
});

it('schedules one daily reminder, replaces it on time change, and cancels it when disabled or logged out', async () => {
  await syncReviewReminder('user-a', { reviewReminder: true, reminderTime: '08:30' });
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
    content: expect.objectContaining({ body: 'Remember to review your words today.', data: { kind: 'dailyReviewReminder', userId: 'user-a', time: '08:30' } }),
    trigger: expect.objectContaining({ type: 'daily', hour: 8, minute: 30 }),
  }));
  await syncReviewReminder('user-a', { reviewReminder: true, reminderTime: '08:30' });
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);

  await syncReviewReminder('user-a', { reviewReminder: true, reminderTime: '19:45' });
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder-1');
  expect(scheduled).toHaveLength(1);
  expect(scheduled[0].content.data?.time).toBe('19:45');

  await syncReviewReminder('user-a', { reviewReminder: false, reminderTime: '19:45' });
  expect(scheduled).toHaveLength(0);
  await syncReviewReminder('user-a', { reviewReminder: true, reminderTime: '07:00' });
  await syncReviewReminder(null, null);
  expect(scheduled).toHaveLength(0);
});

it('keeps reminders unscheduled when notification permission is denied', async () => {
  jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: false } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);
  jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValue({ granted: false } as Awaited<ReturnType<typeof Notifications.requestPermissionsAsync>>);
  expect(await requestReminderPermission()).toBe(false);
  expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  await syncReviewReminder('user-a', { reviewReminder: true, reminderTime: '20:00' });
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});

it('removes another account\'s alarm when restoring the current account', async () => {
  await syncReviewReminder('user-a', { reviewReminder: true, reminderTime: '09:00' });
  await syncReviewReminder('user-b', { reviewReminder: true, reminderTime: '10:00' });
  expect(scheduled).toHaveLength(1);
  expect(scheduled[0].content.data?.userId).toBe('user-b');
});
