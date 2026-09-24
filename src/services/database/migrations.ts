import type { SQLiteDatabase } from 'expo-sqlite';
import { DEFAULT_GROUP_SIZE } from '@/constants/defaults';

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version > 1) throw new Error('Database schema is newer than this app');
  if (version === 1) return;

  // Schema changes and version marker commit together; interrupted upgrades retry safely.
  await db.withExclusiveTransactionAsync(async (tx) => {
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
}
