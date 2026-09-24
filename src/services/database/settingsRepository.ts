import type { SQLiteDatabase } from 'expo-sqlite';
import type { Language, Settings } from '@/models/Settings';

export class SettingsRepository {
  constructor(private readonly db: SQLiteDatabase, private readonly userId: string) {}

  async get(): Promise<Settings> {
    const row = await this.db.getFirstAsync<{ language: Language; review_group_size: number }>('SELECT language, review_group_size FROM user_settings WHERE user_id = ?', this.userId);
    if (!row) throw new Error('Settings row missing');
    return { language: row.language, reviewGroupSize: row.review_group_size };
  }

  async setLanguage(language: Language): Promise<void> {
    await this.db.runAsync('UPDATE user_settings SET language = ? WHERE user_id = ?', language, this.userId);
  }

  async setGroupSize(size: number): Promise<void> {
    if (!Number.isSafeInteger(size) || size < 1) throw new Error('invalidGroupSize');
    await this.db.runAsync('UPDATE user_settings SET review_group_size = ? WHERE user_id = ?', size, this.userId);
  }
}
