import type { SQLiteDatabase } from 'expo-sqlite';
import { SettingsRepository } from '@/services/database/settingsRepository';

it('loads persisted settings and rejects an invalid group size before writing', async () => {
  const runAsync = jest.fn(async () => ({}));
  const db = { getFirstAsync: jest.fn(async () => ({ language: 'vi', review_group_size: 20, review_reminder: 1, reminder_time: '07:15' })), runAsync } as unknown as SQLiteDatabase;
  const repository = new SettingsRepository(db, 'user-a');
  expect(await repository.get()).toEqual({ language: 'vi', reviewGroupSize: 20, reviewReminder: true, reminderTime: '07:15' });
  await expect(repository.setGroupSize(0)).rejects.toThrow('invalidGroupSize');
  expect(runAsync).not.toHaveBeenCalled();
  await repository.setGroupSize(25);
  await repository.setLanguage('en');
  await repository.setReviewReminder(false);
  await expect(repository.setReminderTime('25:00')).rejects.toThrow('invalidReminderTime');
  await repository.setReminderTime('21:30');
  expect(runAsync).toHaveBeenCalledWith('UPDATE user_settings SET review_group_size = ? WHERE user_id = ?', 25, 'user-a');
  expect(runAsync).toHaveBeenCalledWith('UPDATE user_settings SET language = ? WHERE user_id = ?', 'en', 'user-a');
  expect(runAsync).toHaveBeenCalledWith('UPDATE user_settings SET review_reminder = ? WHERE user_id = ?', 0, 'user-a');
  expect(runAsync).toHaveBeenCalledWith('UPDATE user_settings SET reminder_time = ? WHERE user_id = ?', '21:30', 'user-a');
});
