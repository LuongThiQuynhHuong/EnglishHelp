import type { Vocabulary } from './Vocabulary';

export type ReviewMode = 'group' | 'random' | 'mistaken' | 'newest';
export type ReviewSession = { id: string; mode: ReviewMode; questions: Vocabulary[]; answers: Record<string, string>; currentIndex: number };
export type ReviewAnswer = { vocabulary: Vocabulary; answer: string; status: 'correct' | 'incorrect' | 'skipped' };
export type ReviewResult = { total: number; correct: number; incorrect: number; skipped: number; percentage: number; answers: ReviewAnswer[] };
export type ReviewGroup = { number: number; start: number; end: number; words: Vocabulary[] };
