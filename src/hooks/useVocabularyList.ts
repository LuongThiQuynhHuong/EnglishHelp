import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Vocabulary } from '@/models/Vocabulary';
import { useVocabulary } from './useVocabulary';

export function useVocabularyList() {
  const repository = useVocabulary();
  const [items, setItems] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setItems(await repository.list());
    } catch (cause) {
      if (__DEV__) console.error('Vocabulary list failed', cause);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  return { items, loading, error, refresh };
}
