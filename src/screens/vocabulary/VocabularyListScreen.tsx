import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { VocabularyCard } from '@/components/vocabulary/VocabularyCard';
import { useVocabularyList } from '@/hooks/useVocabularyList';
import { spacing } from '@/theme/tokens';

export default function VocabularyListScreen() {
  const { t } = useTranslation();
  const { items, loading, error, refresh } = useVocabularyList();
  return <Screen scroll={false}>
    <View style={{ gap: spacing.md }}><AppText variant="title">{t('vocabulary.title')}</AppText><AppButton title={t('vocabulary.add')} onPress={() => router.push('/vocabulary/new')} /></View>
    {loading ? <LoadingState label={t('app.loading')} /> : error ? <ErrorState message={t('app.error')} retryLabel={t('app.retry')} onRetry={() => void refresh()} /> : <FlatList data={items} keyExtractor={(item) => item.id} contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }} ListEmptyComponent={<EmptyState message={t('vocabulary.noWords')} />} renderItem={({ item }) => <VocabularyCard item={item} onPress={() => router.push({ pathname: '/vocabulary/[id]', params: { id: item.id } })} />} />}
  </Screen>;
}
