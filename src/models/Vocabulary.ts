export type Vocabulary = {
  id: string;
  word: string;
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

export type VocabularyInput = Pick<Vocabulary, 'word' | 'vietnameseMeaning' | 'englishMeaning' | 'imageUrl'>;
