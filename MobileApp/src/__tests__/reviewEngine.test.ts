import type { Vocabulary } from '@/models/Vocabulary';
import { reviewGroups, scoreReview, selectMostMistaken, selectNewest, selectRandom } from '@/services/review/reviewEngine';

function word(id: string, createdAt: string, incorrectCount = 0, lastReviewedAt: string | null = null): Vocabulary {
  return { id, userId: 'user-a', wordClass: null, ipa: null, word: id, vietnameseMeaning: 'nghĩa', englishMeaning: 'meaning', imageUrl: null, createdAt, updatedAt: createdAt, reviewCount: 0, correctCount: 0, incorrectCount, lastReviewedAt };
}

const words = [word('c', '2026-01-03'), word('a', '2026-01-01'), word('b', '2026-01-02')];

it('builds stable groups and calculates actual final ranges after size changes', () => {
  expect(reviewGroups(words, 2).map(({ number, start, end, words: items }) => [number, start, end, items.map((item) => item.id)])).toEqual([[1, 1, 2, ['a', 'b']], [2, 3, 3, ['c']]]);
  expect(reviewGroups(words, 3)).toHaveLength(1);
});

it('selects unique random words and validates count', () => {
  const selected = selectRandom(words, 2, () => 0);
  expect(new Set(selected.map((item) => item.id)).size).toBe(2);
  expect(() => selectRandom(words, 4)).toThrow('invalidCount');
});

it('prioritizes mistakes, then older reviews, and selects newest by creation', () => {
  const candidates = [word('a', '2026-01-01', 2, '2026-03-01'), word('b', '2026-01-02', 3, '2026-04-01'), word('c', '2026-01-03', 2, null)];
  expect(selectMostMistaken(candidates, 3).map((item) => item.id)).toEqual(['b', 'c', 'a']);
  expect(selectNewest(candidates, 2).map((item) => item.id)).toEqual(['c', 'b']);
});

it('counts skipped answers as incorrect while retaining their skipped status', () => {
  const result = scoreReview(words, { a: ' A ', b: 'wrong', c: '   ' });
  expect(result).toMatchObject({ total: 3, correct: 1, incorrect: 2, skipped: 1, percentage: 33 });
  expect(result.answers.map((item) => item.status)).toEqual(['skipped', 'correct', 'incorrect']);
});
