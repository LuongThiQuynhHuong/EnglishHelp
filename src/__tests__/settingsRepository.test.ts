import type { SQLiteDatabase } from 'expo-sqlite';
import { SettingsRepository } from '@/services/database/settingsRepository';

it('loads persisted settings and rejects an invalid group size before writing', async () => {
  const runAsync = jest.fn(async () => ({}));
  const db = { getFirstAsync: jest.fn(async () => ({ language: 'vi', review_group_size: 20 })), runAsync } as unknown as SQLiteDatabase;
  const repository = new SettingsRepository(db);
  expect(await repository.get()).toEqual({ language: 'vi', reviewGroupSize: 20 });
  await expect(repository.setGroupSize(0)).rejects.toThrow('invalidGroupSize');
  expect(runAsync).not.toHaveBeenCalled();
  await repository.setGroupSize(25);
  await repository.setLanguage('en');
  expect(runAsync).toHaveBeenCalledWith('UPDATE settings SET review_group_size = ? WHERE id = 1', 25);
  expect(runAsync).toHaveBeenCalledWith('UPDATE settings SET language = ? WHERE id = 1', 'en');
});
