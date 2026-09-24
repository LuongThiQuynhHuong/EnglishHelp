import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { VocabularyRepository } from '@/services/database/vocabularyRepository';

export function useVocabulary(): VocabularyRepository {
  const db = useSQLiteContext();
  return useMemo(() => new VocabularyRepository(db), [db]);
}
