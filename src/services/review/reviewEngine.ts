import type { ReviewGroup, ReviewResult } from '@/models/Review';
import type { Vocabulary } from '@/models/Vocabulary';
import { answersMatch, normalizeAnswer } from '@/utils/answerNormalization';

export function reviewGroups(words: Vocabulary[], size: number): ReviewGroup[] {
  if (!Number.isSafeInteger(size) || size < 1) throw new Error('invalidGroupSize');
  const ordered = [...words].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const groups: ReviewGroup[] = [];
  for (let index = 0; index < ordered.length; index += size) {
    const subset = ordered.slice(index, index + size);
    groups.push({ number: groups.length + 1, start: index + 1, end: index + subset.length, words: subset });
  }
  return groups;
}

export function selectRandom(words: Vocabulary[], count: number, random: () => number = Math.random): Vocabulary[] {
  validateCount(words, count);
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function selectMostMistaken(words: Vocabulary[], count: number): Vocabulary[] {
  validateCount(words, count);
  return [...words].sort((a, b) =>
    b.incorrectCount - a.incorrectCount ||
    (a.lastReviewedAt ?? '').localeCompare(b.lastReviewedAt ?? '') ||
    a.id.localeCompare(b.id),
  ).slice(0, count);
}

export function selectNewest(words: Vocabulary[], count: number): Vocabulary[] {
  validateCount(words, count);
  return [...words].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)).slice(0, count);
}

function validateCount(words: Vocabulary[], count: number): void {
  if (!Number.isSafeInteger(count) || count < 1 || count > words.length) throw new Error('invalidCount');
}

export function scoreReview(questions: Vocabulary[], answers: Record<string, string>): ReviewResult {
  const scored = questions.map((vocabulary) => {
    const answer = answers[vocabulary.id] ?? '';
    const status = !normalizeAnswer(answer) ? 'skipped' : answersMatch(answer, vocabulary.word) ? 'correct' : 'incorrect';
    return { vocabulary, answer, status } as const;
  });
  const correct = scored.filter((entry) => entry.status === 'correct').length;
  const incorrect = scored.filter((entry) => entry.status === 'incorrect').length;
  const skipped = scored.length - correct - incorrect;
  return { total: scored.length, correct, incorrect, skipped, percentage: scored.length ? Math.round((correct / scored.length) * 100) : 0, answers: scored };
}
