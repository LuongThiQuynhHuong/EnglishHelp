import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { ReviewMode, ReviewResult, ReviewSession } from '@/models/Review';
import type { Vocabulary } from '@/models/Vocabulary';
import { submitReview } from '@/services/review/reviewSubmission';
import { useAuth } from '@/hooks/useAuth';

type ReviewContextValue = {
  session: ReviewSession | null;
  result: ReviewResult | null;
  submitting: boolean;
  start: (mode: ReviewMode, questions: Vocabulary[]) => void;
  setAnswer: (answer: string) => void;
  moveTo: (index: number) => void;
  skip: () => void;
  submit: () => Promise<ReviewResult>;
};

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function ReviewSessionProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const { currentUser } = useAuth();
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submissionInProgress = useRef(false);
  const submittedSessionId = useRef<string | null>(null);

  const start = useCallback((mode: ReviewMode, questions: Vocabulary[]) => {
    if (!currentUser || questions.some((word) => word.userId !== currentUser.id)) throw new Error('Review ownership mismatch');
    submittedSessionId.current = null;
    setResult(null);
    setSession({ id: Crypto.randomUUID(), mode, questions, answers: questions[0] ? { [questions[0].id]: '' } : {}, currentIndex: 0 });
  }, [currentUser]);


  const setAnswer = useCallback((answer: string) => {
    setSession((current) => current ? { ...current, answers: { ...current.answers, [current.questions[current.currentIndex].id]: answer } } : current);
  }, []);

  const moveTo = useCallback((index: number) => {
    setSession((current) => {
      if (!current) return current;
      const currentIndex = Math.max(0, Math.min(index, current.questions.length - 1));
      const wordId = current.questions[currentIndex]?.id;
      return { ...current, currentIndex, answers: wordId && !Object.prototype.hasOwnProperty.call(current.answers, wordId) ? { ...current.answers, [wordId]: '' } : current.answers };
    });
  }, []);

  const skip = useCallback(() => {
    setSession((current) => {
      if (!current) return current;
      const id = current.questions[current.currentIndex].id;
      return { ...current, answers: { ...current.answers, [id]: '' }, currentIndex: Math.min(current.currentIndex + 1, current.questions.length - 1) };
    });
  }, []);

  const submit = useCallback(async () => {
    if (!session || !currentUser || submissionInProgress.current || submittedSessionId.current === session.id || result) throw new Error('Review submission unavailable');
    submissionInProgress.current = true;
    setSubmitting(true);
    try {
      const completed = await submitReview(db, session, currentUser.id);
      submittedSessionId.current = session.id;
      setResult(completed);
      return completed;
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  }, [db, result, session, currentUser]);

  return <ReviewContext.Provider value={{ session, result, submitting, start, setAnswer, moveTo, skip, submit }}>{children}</ReviewContext.Provider>;
}

export function useReviewSession(): ReviewContextValue {
  const value = useContext(ReviewContext);
  if (!value) throw new Error('ReviewSessionProvider is missing');
  return value;
}
