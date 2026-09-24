import { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { FormField } from '@/components/common/FormField';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { VocabularyCard } from '@/components/vocabulary/VocabularyCard';
import { useVocabulary } from '@/hooks/useVocabulary';
import type { Vocabulary } from '@/models/Vocabulary';
import { spacing } from '@/theme/tokens';
import { SEARCH_DEBOUNCE_MS } from '@/constants/defaults';

export default function SearchScreen() {
  const { t } = useTranslation();
  const repository = useVocabulary();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Vocabulary[]>([]);
  const [error, setError] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    const timer = setTimeout(() => {
      void repository.search(query).then((items) => { if (active) { setResults(items); setError(false); } }).catch((cause: unknown) => { if (__DEV__) console.error('Vocabulary search failed', cause); if (active) setError(true); });
    }, SEARCH_DEBOUNCE_MS);
    return () => { active = false; clearTimeout(timer); };
  }, [query, repository]));

  return <Screen scroll={false}>
    <AppText variant="title">{t('search.title')}</AppText>
    <FormField label={t('search.placeholder')} value={query} onChangeText={setQuery} autoCorrect={false} />
    {error ? <ErrorState message={t('app.error')} /> : <FlatList data={results} keyExtractor={(item) => item.id} contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }} ListEmptyComponent={query.trim() ? <EmptyState message={t('search.noResults')} /> : null} renderItem={({ item }) => <VocabularyCard item={item} onPress={() => router.push({ pathname: '/vocabulary/[id]', params: { id: item.id } })} />} />}
  </Screen>;
}
