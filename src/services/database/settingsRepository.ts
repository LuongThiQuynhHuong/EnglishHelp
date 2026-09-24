import type { SQLiteDatabase } from 'expo-sqlite';
import type { Language, Settings } from '@/models/Settings';

export class SettingsRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async get(): Promise<Settings> {
    const row = await this.db.getFirstAsync<{ language: Language; review_group_size: number }>('SELECT language, review_group_size FROM settings WHERE id = 1');
    if (!row) throw new Error('Settings row missing');
    return { language: row.language, reviewGroupSize: row.review_group_size };
  }

  async setLanguage(language: Language): Promise<void> {
    await this.db.runAsync('UPDATE settings SET language = ? WHERE id = 1', language);
  }

  async setGroupSize(size: number): Promise<void> {
    if (!Number.isSafeInteger(size) || size < 1) throw new Error('invalidGroupSize');
    await this.db.runAsync('UPDATE settings SET review_group_size = ? WHERE id = 1', size);
  }
}
