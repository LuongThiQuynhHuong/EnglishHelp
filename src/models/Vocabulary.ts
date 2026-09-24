import type { WordClass } from './WordClass';

export type Vocabulary = {
  id: string;
  userId: string;
  word: string;
  wordClass: WordClass | null;
  ipa: string | null;
  vietnameseMeaning: string;
  englishMeaning: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: string | null;
};

export type VocabularyInput = Pick<Vocabulary, 'word' | 'vietnameseMeaning' | 'englishMeaning' | 'imageUrl' | 'wordClass' | 'ipa'>;
