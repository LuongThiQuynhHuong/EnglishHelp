import type { Vocabulary } from '@/models/Vocabulary';

export type VocabularyRow = {
  id: string; user_id: string; word: string; word_class: Vocabulary['wordClass']; ipa: string | null; vietnamese_meaning: string; english_meaning: string; image_url: string | null;
  created_at: string; updated_at: string; review_count: number; correct_count: number; incorrect_count: number; last_reviewed_at: string | null;
};

export function toVocabulary(row: VocabularyRow): Vocabulary {
  return {
    id: row.id, userId: row.user_id, word: row.word, wordClass: row.word_class, ipa: row.ipa, vietnameseMeaning: row.vietnamese_meaning, englishMeaning: row.english_meaning,
    imageUrl: row.image_url, createdAt: row.created_at, updatedAt: row.updated_at,
    reviewCount: row.review_count, correctCount: row.correct_count, incorrectCount: row.incorrect_count,
    lastReviewedAt: row.last_reviewed_at,
  };
}
