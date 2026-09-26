import type { Vocabulary } from '@/models/Vocabulary';
import { BackupValidationError, parseBackup, validVocabulary } from '@/services/importExport/backupValidation';

const backupWord: Vocabulary = { id: 'a', userId: 'user-a', wordClass: null, ipa: null, word: 'apple', vietnameseMeaning: 'quả táo', englishMeaning: 'fruit', imageUrl: 'https://example.com/view?id=1', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', reviewCount: 2, correctCount: 1, incorrectCount: 1, lastReviewedAt: '2026-01-02T00:00:00Z' };

it('validates JSON and preserves remote URLs without requiring an extension', () => {
  const parsed = parseBackup(JSON.stringify({ version: 1, exportedAt: '2026-09-24T00:00:00Z', vocabularies: [backupWord, { ...backupWord, id: 'bad', imageUrl: 'file:///local.jpg' }] }));
  expect(parsed.backup.vocabularies).toEqual([{ ...backupWord, userId: undefined }].map(({ userId: _userId, ...word }) => word));
  expect(parsed.invalid).toBe(1);
  expect(validVocabulary({ ...backupWord, incorrectCount: -1 })).toBe(false);
  expect(validVocabulary({ ...backupWord, createdAt: '2026-02-30T00:00:00Z' })).toBe(false);
  expect(() => parseBackup('not json')).toThrow(BackupValidationError);
  expect(() => parseBackup(JSON.stringify({ version: 3, exportedAt: '2026-09-24T00:00:00Z', vocabularies: [] }))).toThrow('unsupportedBackup');
});

it('loads old backups without word class or IPA and discards imported ownership', () => {
  const { userId: _userId, wordClass: _wordClass, ipa: _ipa, ...oldWord } = backupWord;
  const parsed = parseBackup(JSON.stringify({ version: 1, exportedAt: '2026-09-24T00:00:00Z', vocabularies: [{ ...oldWord, userId: 'external-user' }] }));
  expect(parsed.backup.vocabularies[0]).toMatchObject({ wordClass: null, ipa: null });
  expect(parsed.backup.vocabularies[0]).not.toHaveProperty('userId');
});

it('preserves word class and IPA in version 2 backups', () => {
  const parsed = parseBackup(JSON.stringify({ version: 2, exportedAt: '2026-09-24T00:00:00Z', vocabularies: [{ ...backupWord, wordClass: 'noun', ipa: '/kɑːd/' }] }));
  expect(parsed.backup.vocabularies[0]).toMatchObject({ wordClass: 'noun', ipa: '/kɑːd/' });
  expect(parsed.backup.vocabularies[0]).not.toHaveProperty('userId');
});
