import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { VocabularyRepository } from '@/services/database/vocabularyRepository';
import { useAuth } from '@/hooks/useAuth';

export function useVocabulary(): VocabularyRepository {
  const db = useSQLiteContext();
  const { currentUser } = useAuth();
  const repository = useMemo(() => new VocabularyRepository(db, currentUser?.id ?? ''), [db, currentUser?.id]);
  if (!currentUser) throw new Error('Authentication required');
  return repository;
}
