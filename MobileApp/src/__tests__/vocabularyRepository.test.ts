import type { SQLiteDatabase } from 'expo-sqlite';
import { VocabularyRepository } from '@/services/database/vocabularyRepository';
import type { VocabularyRow } from '@/services/database/rowMappers';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'new-id' }));

const row: VocabularyRow = {
  id: 'existing', user_id: 'user-a', word_class: null, ipa: null, word: 'apple', vietnamese_meaning: 'quả táo', english_meaning: 'fruit', image_url: null,
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
  review_count: 2, correct_count: 1, incorrect_count: 1, last_reviewed_at: '2026-01-02T00:00:00.000Z',
};

it('creates records with zero review stats and updates without resetting existing stats', async () => {
  const runAsync = jest.fn(async () => ({}));
  const getAllAsync = jest.fn(async () => []);
  const getFirstAsync = jest.fn(async () => row);
  const db = { runAsync, getAllAsync, getFirstAsync } as unknown as SQLiteDatabase;
  const repository = new VocabularyRepository(db, 'user-a');
  const created = await repository.create({ word: 'banana', vietnameseMeaning: 'chuối', englishMeaning: 'yellow fruit', imageUrl: 'https://example.com/view?id=1', wordClass: 'noun', ipa: '/bəˈnænə/' });
  expect(created).toMatchObject({ id: 'new-id', wordClass: 'noun', ipa: '/bəˈnænə/', imageUrl: 'https://example.com/view?id=1', reviewCount: 0, incorrectCount: 0 });
  expect(runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO vocabularies'), 'new-id', 'user-a', 'banana', 'noun', '/bəˈnænə/', 'chuối', 'yellow fruit', 'https://example.com/view?id=1', expect.anything(), expect.anything(), 0, 0, 0, null, expect.anything());

  const updated = await repository.update('existing', { word: 'apple', vietnameseMeaning: 'quả táo', englishMeaning: 'fruit', imageUrl: 'https://example.com/new', wordClass: 'noun', ipa: '/ˈæpəl/' });
  expect(updated).toMatchObject({ createdAt: row.created_at, reviewCount: 2, correctCount: 1, incorrectCount: 1, imageUrl: 'https://example.com/new', wordClass: 'noun', ipa: '/ˈæpəl/' });
  await repository.delete('existing');
  expect(runAsync).toHaveBeenCalledWith('DELETE FROM vocabularies WHERE id = ? AND user_id = ?', 'existing', 'user-a');
});

it('searches the normalized field with bound and escaped wildcard text', async () => {
  const getAllAsync = jest.fn(async () => [row]);
  const repository = new VocabularyRepository({ getAllAsync } as unknown as SQLiteDatabase, 'user-a');
  const matches = await repository.search('  TÁO%_ ');
  expect(matches[0].word).toBe('apple');
  expect(getAllAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = ? AND search_text LIKE ?'), 'user-a', '%tao\\%\\_%');
});

it('scopes list, detail, and search queries to the active user', async () => {
  const db = { getAllAsync: jest.fn(async () => []), getFirstAsync: jest.fn(async () => null) } as unknown as SQLiteDatabase;
  const userA = new VocabularyRepository(db, 'user-a');
  const userB = new VocabularyRepository(db, 'user-b');
  await userA.list(); await userB.list(); await userA.get('word-a'); await userB.get('word-a'); await userA.search('apple'); await userB.search('apple');
  expect(db.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = ?'), 'user-a');
  expect(db.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = ?'), 'user-b');
  expect(db.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('AND user_id = ?'), 'word-a', 'user-a');
  expect(db.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('AND user_id = ?'), 'word-a', 'user-b');
  expect(db.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('AND search_text LIKE ?'), 'user-a', '%apple%');
  expect(db.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('AND search_text LIKE ?'), 'user-b', '%apple%');
});
