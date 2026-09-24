import { planImport } from '@/services/importExport/backupValidation';
import type { Vocabulary } from '@/models/Vocabulary';

const backupWord: Vocabulary = { id: 'a', userId: 'user-a', wordClass: null, ipa: null, word: 'apple', vietnameseMeaning: 'quả táo', englishMeaning: 'fruit', imageUrl: 'https://example.com/view?id=1', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', reviewCount: 2, correctCount: 1, incorrectCount: 1, lastReviewedAt: '2026-01-02T00:00:00Z' };

it('skips duplicate content and reports conflicting IDs without importing them', () => {
  const { records, summary } = planImport([backupWord], [
    { ...backupWord, id: 'different-id' },
    { ...backupWord, englishMeaning: 'company' },
    { ...backupWord, id: 'new-id', englishMeaning: 'company' },
    { ...backupWord, id: 'new-id-2', englishMeaning: 'company' },
  ], 1);
  expect(records.map((item) => item.id)).toEqual(['new-id']);
  expect(summary).toEqual({ imported: 1, duplicates: 2, invalid: 2 });
});
