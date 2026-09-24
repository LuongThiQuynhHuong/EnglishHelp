import type { SQLiteDatabase } from 'expo-sqlite';
import { VocabularyRepository } from '@/services/database/vocabularyRepository';
import type { VocabularyRow } from '@/services/database/rowMappers';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'new-id' }));

const row: VocabularyRow = {
  id: 'existing', word: 'apple', vietnamese_meaning: 'quả táo', english_meaning: 'fruit', image_url: null,
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
  review_count: 2, correct_count: 1, incorrect_count: 1, last_reviewed_at: '2026-01-02T00:00:00.000Z',
};

it('creates records with zero review stats and updates without resetting existing stats', async () => {
  const runAsync = jest.fn(async () => ({}));
  const getAllAsync = jest.fn(async () => []);
  const getFirstAsync = jest.fn(async () => row);
  const db = { runAsync, getAllAsync, getFirstAsync } as unknown as SQLiteDatabase;
  const repository = new VocabularyRepository(db);
  const created = await repository.create({ word: 'banana', vietnameseMeaning: 'chuối', englishMeaning: 'yellow fruit', imageUrl: 'https://example.com/view?id=1' });
  expect(created).toMatchObject({ id: 'new-id', imageUrl: 'https://example.com/view?id=1', reviewCount: 0, incorrectCount: 0 });
  expect(runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO vocabularies'), expect.anything(), 'banana', 'chuối', 'yellow fruit', 'https://example.com/view?id=1', expect.anything(), expect.anything(), 0, 0, 0, null, expect.anything());

  const updated = await repository.update('existing', { word: 'apple', vietnameseMeaning: 'quả táo', englishMeaning: 'fruit', imageUrl: 'https://example.com/new' });
  expect(updated).toMatchObject({ createdAt: row.created_at, reviewCount: 2, correctCount: 1, incorrectCount: 1, imageUrl: 'https://example.com/new' });
  await repository.delete('existing');
  expect(runAsync).toHaveBeenCalledWith('DELETE FROM vocabularies WHERE id = ?', 'existing');
});

it('searches the normalized field with bound and escaped wildcard text', async () => {
  const getAllAsync = jest.fn(async () => [row]);
  const repository = new VocabularyRepository({ getAllAsync } as unknown as SQLiteDatabase);
  const matches = await repository.search('  TÁO%_ ');
  expect(matches[0].word).toBe('apple');
  expect(getAllAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE search_text LIKE ?'), '%tao\\%\\_%');
});
