import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/common/AppHeader';
import { Screen } from '@/components/common/Screen';
import { AppIcon } from '@/components/common/AppIcon';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { VocabularyCard } from '@/components/vocabulary/VocabularyCard';
import { useVocabularyList } from '@/hooks/useVocabularyList';
import { normalizeSearchText } from '@/utils/searchNormalization';
import { colors, spacing, typography } from '@/theme/tokens';

export default function HomeScreen() {
  const { t } = useTranslation(); const { items, loading, error, refresh } = useVocabularyList();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => { const term = normalizeSearchText(query); return term ? items.filter((item) => normalizeSearchText(`${item.word} ${item.vietnameseMeaning} ${item.englishMeaning} ${item.ipa ?? ''} ${item.wordClass ?? ''}`).includes(term)) : items; }, [items, query]);
  return <Screen scroll={false} header={<AppHeader title={t('home.yourVocabulary')} leading="menu" />} style={styles.content}><View style={styles.search}><AppIcon name="search" /><TextInput accessibilityLabel={t('search.placeholder')} placeholder={t('search.placeholder')} value={query} onChangeText={setQuery} style={styles.input} placeholderTextColor={colors.muted} />{!!query && <Pressable accessibilityLabel={t('search.clear')} onPress={() => setQuery('')}><AppIcon name="close" /></Pressable>}</View>
    {loading ? <LoadingState label={t('app.loading')} /> : error ? <ErrorState message={t('app.error')} retryLabel={t('app.retry')} onRetry={() => void refresh()} /> : <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<EmptyState message={query ? t('search.noResults') : t('home.noWords')} />} renderItem={({ item }) => <VocabularyCard item={item} onPress={() => router.push({ pathname: '/vocabulary/[id]', params: { id: item.id } })} />} />}
  </Screen>;
}
const styles = StyleSheet.create({ content: { padding: 0, gap: 0 }, search: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 10, alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 54, gap: spacing.sm, margin: spacing.lg }, input: { flex: 1, color: colors.text, fontSize: typography.body }, list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1, backgroundColor: colors.background } });
