jest.mock('expo-notifications', () => {
  throw new Error('The push notification entry must not load for local reminders');
});

it('loads local notification APIs without the push notification entry', () => {
  const { localNotifications } = jest.requireActual<typeof import('@/services/reminders/localNotifications')>('@/services/reminders/localNotifications');
  expect(typeof localNotifications.scheduleNotificationAsync).toBe('function');
  expect(typeof localNotifications.getPermissionsAsync).toBe('function');
});
