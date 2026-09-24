import type { SQLiteDatabase } from 'expo-sqlite';
import type { ReviewResult, ReviewSession } from '@/models/Review';
import { scoreReview } from './reviewEngine';

export async function submitReview(db: SQLiteDatabase, session: ReviewSession, userId: string, reviewedAt = new Date().toISOString()): Promise<ReviewResult> {
  if (session.questions.some((word) => word.userId !== userId)) throw new Error('Review ownership mismatch');
  const result = scoreReview(session.questions, session.answers);
  // A single transaction prevents a partially updated review if a write fails.
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const entry of result.answers) {
      await tx.runAsync(
        'UPDATE vocabularies SET review_count = review_count + 1, correct_count = correct_count + ?, incorrect_count = incorrect_count + ?, last_reviewed_at = ?, updated_at = ? WHERE id = ? AND user_id = ?',
        entry.status === 'correct' ? 1 : 0,
        entry.status !== 'correct' ? 1 : 0,
        reviewedAt,
        reviewedAt,
        entry.vocabulary.id,
        userId,
      );
    }
  });
  return result;
}
