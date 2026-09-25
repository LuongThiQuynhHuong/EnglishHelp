import { DatabaseSync } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { migrateDatabase, LEGACY_USER_ID } from '@/services/database/migrations';
import { VocabularyRepository } from '@/services/database/vocabularyRepository';
import { UserRepository } from '@/services/database/userRepository';
import { SettingsRepository } from '@/services/database/settingsRepository';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'first-user' }));

function createDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  const database = {
    execAsync: async (sql: string) => { sqlite.exec(sql); },
    runAsync: async (sql: string, ...params: (string | number | null)[]) => sqlite.prepare(sql).run(...params),
    getFirstAsync: async <T>(sql: string, ...params: (string | number | null)[]) => (sqlite.prepare(sql).get(...params) ?? null) as T | null,
    getAllAsync: async <T>(sql: string, ...params: (string | number | null)[]) => sqlite.prepare(sql).all(...params) as T[],
    withExclusiveTransactionAsync: async (task: (tx: SQLiteDatabase) => Promise<unknown>) => {
      sqlite.exec('BEGIN IMMEDIATE');
      try { const result = await task(database as unknown as SQLiteDatabase); sqlite.exec('COMMIT'); return result; }
      catch (cause) { sqlite.exec('ROLLBACK'); throw cause; }
    },
  };
  return { sqlite, database: database as unknown as SQLiteDatabase };
}

it('migrates an existing word and review counters, then isolates two accounts', async () => {
  const { sqlite, database } = createDatabase();
  try {
    sqlite.exec(`CREATE TABLE vocabularies (id TEXT PRIMARY KEY, word TEXT NOT NULL, vietnamese_meaning TEXT NOT NULL, english_meaning TEXT NOT NULL, image_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, review_count INTEGER NOT NULL, correct_count INTEGER NOT NULL, incorrect_count INTEGER NOT NULL, last_reviewed_at TEXT, search_text TEXT NOT NULL);
      CREATE TABLE settings (id INTEGER PRIMARY KEY, language TEXT NOT NULL, review_group_size INTEGER NOT NULL);
      INSERT INTO settings VALUES (1, 'vi', 20);
      INSERT INTO vocabularies VALUES ('old', 'card', 'thẻ', 'paper', NULL, '2026-01-01', '2026-01-02', 7, 5, 2, '2026-01-02', 'card the paper');
      PRAGMA user_version = 1;`);
    await migrateDatabase(database);
    expect(sqlite.prepare('PRAGMA user_version').get()).toMatchObject({ user_version: 3 });
    expect(sqlite.prepare('SELECT user_id, review_count, correct_count, incorrect_count, word_class, ipa FROM vocabularies WHERE id = ?').get('old')).toMatchObject({ user_id: LEGACY_USER_ID, review_count: 7, correct_count: 5, incorrect_count: 2, word_class: null, ipa: null });
    const users = new UserRepository(database);
    const firstUser = await users.create('first@example.com', 'test-hash');
    expect(firstUser.id).toBe('first-user');
    await users.saveSession(firstUser.id);
    expect(await users.restoreSession()).toMatchObject({ id: firstUser.id });
    await users.saveSession(null);
    expect(await users.restoreSession()).toBeNull();
    expect(sqlite.prepare('SELECT user_id FROM vocabularies WHERE id = ?').get('old')).toMatchObject({ user_id: 'first-user' });
    expect(sqlite.prepare('SELECT language, review_group_size, review_reminder, reminder_time FROM user_settings WHERE user_id = ?').get('first-user')).toMatchObject({ language: 'vi', review_group_size: 20, review_reminder: 0, reminder_time: '20:00' });
    const firstSettings = new SettingsRepository(database, 'first-user');
    await firstSettings.setReviewReminder(true);
    await firstSettings.setReminderTime('06:45');
    expect(await firstSettings.get()).toMatchObject({ reviewReminder: true, reminderTime: '06:45' });
    sqlite.exec(`INSERT INTO users (id, email, password_hash, display_name, auth_provider, created_at, updated_at) VALUES ('a', 'a@example.com', 'hash', 'A', 'local', '2026', '2026'), ('b', 'b@example.com', 'hash', 'B', 'local', '2026', '2026'); UPDATE vocabularies SET user_id = 'a' WHERE id = 'old';`);
    sqlite.exec("INSERT INTO user_settings (user_id) VALUES ('b')");
    expect(await new SettingsRepository(database, 'b').get()).toMatchObject({ reviewReminder: false, reminderTime: '20:00' });
    expect(await firstSettings.get()).toMatchObject({ reviewReminder: true, reminderTime: '06:45' });
    const a = new VocabularyRepository(database, 'a');
    const b = new VocabularyRepository(database, 'b');
    expect((await a.list()).map((word) => word.id)).toEqual(['old']);
    expect(await b.list()).toEqual([]);
    expect(await b.get('old')).toBeNull();
    expect(await b.search('card')).toEqual([]);
    await b.delete('old');
    expect(await a.get('old')).toMatchObject({ reviewCount: 7 });
    const { userId: _owner, ...backupWord } = (await a.get('old'))!;
    const malicious = { ...backupWord, userId: 'a' };
    await b.insertMany([malicious]);
    expect(await b.list()).toEqual([expect.objectContaining({ userId: 'b', word: 'card' })]);
    expect(await a.get('first-user')).toBeNull();
  } finally { sqlite.close(); }
});

it('adds reminder defaults to existing version 2 user settings without changing preferences', async () => {
  const { sqlite, database } = createDatabase();
  try {
    sqlite.exec("CREATE TABLE user_settings (user_id TEXT PRIMARY KEY, language TEXT NOT NULL, review_group_size INTEGER NOT NULL); INSERT INTO user_settings VALUES ('existing-user', 'vi', 42); PRAGMA user_version = 2;");
    await migrateDatabase(database);
    expect(sqlite.prepare('PRAGMA user_version').get()).toMatchObject({ user_version: 3 });
    expect(await new SettingsRepository(database, 'existing-user').get()).toEqual({ language: 'vi', reviewGroupSize: 42, reviewReminder: false, reminderTime: '20:00' });
  } finally { sqlite.close(); }
});
