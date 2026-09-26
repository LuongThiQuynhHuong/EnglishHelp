import type { SQLiteDatabase } from 'expo-sqlite';
import type { ReviewSession } from '@/models/Review';
import type { Vocabulary } from '@/models/Vocabulary';
import { submitReview } from '@/services/review/reviewSubmission';

const base: Omit<Vocabulary, 'id' | 'word'> = { userId: 'user-a', wordClass: null, ipa: null, vietnameseMeaning: 'nghĩa', englishMeaning: 'meaning', imageUrl: null, createdAt: '2026-01-01', updatedAt: '2026-01-01', reviewCount: 0, correctCount: 0, incorrectCount: 0, lastReviewedAt: null };

it('writes correct, wrong, and skipped questions and counts skipped as incorrect', async () => {
  const runAsync = jest.fn(async () => ({}));
  const db = { withExclusiveTransactionAsync: jest.fn(async (work: (tx: { runAsync: typeof runAsync }) => Promise<void>) => work({ runAsync })) } as unknown as SQLiteDatabase;
  const session: ReviewSession = { id: 'session', mode: 'random', questions: [{ ...base, id: 'a', word: 'apple' }, { ...base, id: 'b', word: 'banana' }, { ...base, id: 'c', word: 'cat' }], answers: { a: 'APPLE', b: 'pear' }, currentIndex: 0 };
  const result = await submitReview(db, session, 'user-a', '2026-09-24T00:00:00.000Z');
  expect(result).toMatchObject({ correct: 1, incorrect: 2, skipped: 1 });
  expect(runAsync).toHaveBeenCalledTimes(3);
  expect(runAsync).toHaveBeenCalledWith(expect.any(String), 1, 0, '2026-09-24T00:00:00.000Z', '2026-09-24T00:00:00.000Z', 'a', 'user-a');
  expect(runAsync).toHaveBeenCalledWith(expect.any(String), 0, 1, '2026-09-24T00:00:00.000Z', '2026-09-24T00:00:00.000Z', 'b', 'user-a');
  expect(runAsync).toHaveBeenCalledWith(expect.any(String), 0, 1, '2026-09-24T00:00:00.000Z', '2026-09-24T00:00:00.000Z', 'c', 'user-a');
});

it('rejects a review session containing another user’s vocabulary before writing', async () => {
  const db = { withExclusiveTransactionAsync: jest.fn() } as unknown as SQLiteDatabase;
  const session: ReviewSession = { id: 'session', mode: 'random', questions: [{ ...base, id: 'b', word: 'banana', userId: 'user-b' }], answers: { b: 'banana' }, currentIndex: 0 };
  await expect(submitReview(db, session, 'user-a')).rejects.toThrow('Review ownership mismatch');
  expect(db.withExclusiveTransactionAsync).not.toHaveBeenCalled();
});
