import type { SQLiteDatabase } from 'expo-sqlite';
import type { ReviewResult, ReviewSession } from '@/models/Review';
import { scoreReview } from './reviewEngine';

export async function submitReview(db: SQLiteDatabase, session: ReviewSession, reviewedAt = new Date().toISOString()): Promise<ReviewResult> {
  const result = scoreReview(session.questions, session.answers);
  // A single transaction prevents a partially updated review if a write fails.
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const entry of result.answers) {
      if (entry.status === 'skipped') continue;
      await tx.runAsync(
        'UPDATE vocabularies SET review_count = review_count + 1, correct_count = correct_count + ?, incorrect_count = incorrect_count + ?, last_reviewed_at = ?, updated_at = ? WHERE id = ?',
        entry.status === 'correct' ? 1 : 0,
        entry.status === 'incorrect' ? 1 : 0,
        reviewedAt,
        reviewedAt,
        entry.vocabulary.id,
      );
    }
  });
  return result;
}
