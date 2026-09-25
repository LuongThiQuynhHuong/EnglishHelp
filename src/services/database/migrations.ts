import type { SQLiteDatabase } from 'expo-sqlite';
import { DEFAULT_GROUP_SIZE } from '@/constants/defaults';

export const LEGACY_USER_ID = 'legacy-local-data';

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version > 3) throw new Error('Database schema is newer than this app');
  if (version === 3) return;

  if (version === 0) await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(`
      CREATE TABLE IF NOT EXISTS vocabularies (
        id TEXT PRIMARY KEY NOT NULL,
        word TEXT NOT NULL,
        vietnamese_meaning TEXT NOT NULL,
        english_meaning TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
        correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
        incorrect_count INTEGER NOT NULL DEFAULT 0 CHECK (incorrect_count >= 0),
        last_reviewed_at TEXT,
        search_text TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_vocab_created ON vocabularies(created_at, id);
      CREATE INDEX IF NOT EXISTS idx_vocab_mistakes ON vocabularies(incorrect_count, last_reviewed_at);
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
        language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'vi')),
        review_group_size INTEGER NOT NULL DEFAULT ${DEFAULT_GROUP_SIZE} CHECK (review_group_size > 0)
      );
    `);
    await tx.runAsync('INSERT OR IGNORE INTO settings (id, language, review_group_size) VALUES (1, ?, ?)', 'en', DEFAULT_GROUP_SIZE);
    await tx.execAsync('PRAGMA user_version = 1');
  });

  // Keep old rows and review counters intact. The first registered account claims this
  // reserved owner; later accounts receive separate data and preferences.
  if (version < 2) await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT COLLATE NOCASE UNIQUE,
        password_hash TEXT,
        display_name TEXT NOT NULL,
        avatar_uri TEXT,
        auth_provider TEXT NOT NULL,
        provider_user_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        CHECK ((auth_provider = 'legacy' AND email IS NULL AND password_hash IS NULL) OR (auth_provider != 'legacy' AND email IS NOT NULL))
      );
      CREATE UNIQUE INDEX idx_users_provider ON users(auth_provider, provider_user_id) WHERE provider_user_id IS NOT NULL;
      CREATE TABLE auth_session (id INTEGER PRIMARY KEY CHECK (id = 1), user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE);
      CREATE TABLE user_settings (
        user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'vi')),
        review_group_size INTEGER NOT NULL DEFAULT ${DEFAULT_GROUP_SIZE} CHECK (review_group_size > 0)
      );
    `);
    const now = new Date().toISOString();
    await tx.runAsync('INSERT INTO users (id, display_name, auth_provider, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', LEGACY_USER_ID, '', 'legacy', now, now);
    await tx.runAsync('INSERT INTO user_settings (user_id, language, review_group_size) SELECT ?, language, review_group_size FROM settings WHERE id = 1', LEGACY_USER_ID);
    await tx.execAsync(`
      CREATE TABLE vocabularies_new (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id),
        word TEXT NOT NULL,
        word_class TEXT,
        ipa TEXT,
        vietnamese_meaning TEXT NOT NULL,
        english_meaning TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
        correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
        incorrect_count INTEGER NOT NULL DEFAULT 0 CHECK (incorrect_count >= 0),
        last_reviewed_at TEXT,
        search_text TEXT NOT NULL
      );
      INSERT INTO vocabularies_new (id, user_id, word, vietnamese_meaning, english_meaning, image_url, created_at, updated_at, review_count, correct_count, incorrect_count, last_reviewed_at, search_text)
        SELECT id, '${LEGACY_USER_ID}', word, vietnamese_meaning, english_meaning, image_url, created_at, updated_at, review_count, correct_count, incorrect_count, last_reviewed_at, search_text FROM vocabularies;
      DROP TABLE vocabularies;
      ALTER TABLE vocabularies_new RENAME TO vocabularies;
      CREATE INDEX idx_vocab_user_created ON vocabularies(user_id, created_at, id);
      CREATE INDEX idx_vocab_user_mistakes ON vocabularies(user_id, incorrect_count, last_reviewed_at);
      PRAGMA user_version = 2;
    `);
  });

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(`
      ALTER TABLE user_settings ADD COLUMN review_reminder INTEGER NOT NULL DEFAULT 0 CHECK (review_reminder IN (0, 1));
      ALTER TABLE user_settings ADD COLUMN reminder_time TEXT NOT NULL DEFAULT '20:00' CHECK (reminder_time GLOB '[0-2][0-9]:[0-5][0-9]' AND reminder_time BETWEEN '00:00' AND '23:59');
      PRAGMA user_version = 3;
    `);
  });
}
