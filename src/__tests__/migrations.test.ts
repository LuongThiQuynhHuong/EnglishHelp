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
  expect(tx.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT OR IGNORE INTO settings'), 'en', 30);
});
