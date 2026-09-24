import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { AppButton } from '@/components/common/AppButton';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { VocabularyCard } from '@/components/vocabulary/VocabularyCard';
import { useVocabularyList } from '@/hooks/useVocabularyList';
import { useReviewSession } from '@/hooks/useReviewSession';
import { selectRandom } from '@/services/review/reviewEngine';
import { HOME_RECENT_COUNT, REVIEW_COUNT_PRESETS } from '@/constants/defaults';
import { commonStyles } from '@/theme/styles';
import { spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { items, loading, error, refresh } = useVocabularyList();
  const { start } = useReviewSession();
  const reviewed = items.filter((item) => item.reviewCount > 0).length;

  function quickStart() {
    const selected = selectRandom(items, Math.min(REVIEW_COUNT_PRESETS[0], items.length));
    start('random', selected);
    router.push('/review/session');
  }

  return <Screen><AppText variant="title">{t('home.greeting')}</AppText>
    {loading ? <LoadingState label={t('app.loading')} /> : error ? <ErrorState message={t('app.error')} retryLabel={t('app.retry')} onRetry={() => void refresh()} /> : items.length === 0 ? <><EmptyState message={t('home.noWords')} /><AppButton title={t('vocabulary.add')} onPress={() => router.push('/vocabulary/new')} /></> : <>
      <View style={[commonStyles.card, { gap: spacing.sm }]}><AppText>{t('home.total')}: {items.length}</AppText><AppText>{t('home.reviewed')}: {reviewed}</AppText><AppText>{t('home.new')}: {items.length - reviewed}</AppText></View>
      <AppButton title={t('home.quickReview')} onPress={quickStart} />
      <AppText variant="subtitle">{t('home.recent')}</AppText>
      {items.slice(0, HOME_RECENT_COUNT).map((item) => <VocabularyCard key={item.id} item={item} onPress={() => router.push({ pathname: '/vocabulary/[id]', params: { id: item.id } })} />)}
    </>}
  </Screen>;
}
