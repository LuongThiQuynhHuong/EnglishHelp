import type { SQLiteDatabase } from 'expo-sqlite';
import { migrateDatabase } from '@/services/database/migrations';

it('creates a URL-only vocabulary image column and versioned settings', async () => {
  const sql: string[] = [];
  const tx = { execAsync: jest.fn(async (statement: string) => { sql.push(statement); }), runAsync: jest.fn(async () => ({})) };
  const db = {
    execAsync: jest.fn(async () => undefined),
    getFirstAsync: jest.fn(async () => ({ user_version: 0 })),
    withExclusiveTransactionAsync: jest.fn(async (task: (value: typeof tx) => Promise<void>) => task(tx)),
  } as unknown as SQLiteDatabase;
  await migrateDatabase(db);
  expect(sql.join(' ')).toContain('image_url TEXT');
  expect(sql.join(' ')).toContain('review_group_size INTEGER');
  expect(sql.join(' ')).toContain('PRAGMA user_version = 1');
  expect(sql.join(' ')).toContain('CREATE TABLE users');
  expect(sql.join(' ')).toContain('CREATE TABLE user_settings');
  expect(sql.join(' ')).toContain('word_class TEXT');
  expect(sql.join(' ')).toContain('ipa TEXT');
  expect(sql.join(' ')).toContain('INSERT INTO vocabularies_new');
  expect(sql.join(' ')).toContain('PRAGMA user_version = 2');
  expect(sql.join(' ')).toContain('ALTER TABLE user_settings ADD COLUMN review_reminder');
  expect(sql.join(' ')).toContain('ALTER TABLE user_settings ADD COLUMN reminder_time');
  expect(sql.join(' ')).toContain('PRAGMA user_version = 3');
  expect(tx.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT OR IGNORE INTO settings'), 'en', 30);
});

it('upgrades version 2 settings without rebuilding user data', async () => {
  const tx = { execAsync: jest.fn(async () => undefined) };
  const db = { execAsync: jest.fn(async () => undefined), getFirstAsync: jest.fn(async () => ({ user_version: 2 })), withExclusiveTransactionAsync: jest.fn(async (task: (value: typeof tx) => Promise<void>) => task(tx)) } as unknown as SQLiteDatabase;
  await migrateDatabase(db);
  expect(db.withExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
  expect(tx.execAsync).toHaveBeenCalledWith(expect.stringContaining('ALTER TABLE user_settings ADD COLUMN review_reminder'));
  expect(tx.execAsync).toHaveBeenCalledWith(expect.stringContaining('PRAGMA user_version = 3'));
});

it('upgrades version 1 by copying vocabulary and review statistics before replacing the old table', async () => {
  const sql: string[] = [];
  const tx = { execAsync: jest.fn(async (statement: string) => { sql.push(statement); }), runAsync: jest.fn(async () => ({})) };
  const db = { execAsync: jest.fn(async () => undefined), getFirstAsync: jest.fn(async () => ({ user_version: 1 })), withExclusiveTransactionAsync: jest.fn(async (task: (value: typeof tx) => Promise<void>) => task(tx)) } as unknown as SQLiteDatabase;
  await migrateDatabase(db);
  expect(db.withExclusiveTransactionAsync).toHaveBeenCalledTimes(2);
  const migration = sql.join(' ');
  expect(migration.indexOf('INSERT INTO vocabularies_new')).toBeLessThan(migration.indexOf('DROP TABLE vocabularies'));
  expect(migration).toContain('review_count, correct_count, incorrect_count, last_reviewed_at');
});
