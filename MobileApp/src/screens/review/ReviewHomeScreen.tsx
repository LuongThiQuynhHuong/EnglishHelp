import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { EmptyState } from '@/components/common/EmptyState';
import { AppButton } from '@/components/common/AppButton';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { useVocabularyList } from '@/hooks/useVocabularyList';
import { AppHeader } from '@/components/common/AppHeader';

export default function ReviewHomeScreen() {
  const { t } = useTranslation();
  const { items, loading, error, refresh } = useVocabularyList();
  return <Screen header={<AppHeader title={t('review.title')} leading="none" />}>
    {loading ? <LoadingState label={t('app.loading')} /> : error ? <ErrorState message={t('app.error')} retryLabel={t('app.retry')} onRetry={() => void refresh()} /> : items.length === 0 ? <EmptyState message={t('review.noWords')} /> : <>
      <AppButton title={t('review.byGroup')} onPress={() => router.push('/review/groups')} />
      <AppButton title={t('review.random')} variant="secondary" onPress={() => router.push({ pathname: '/review/count', params: { mode: 'random' } })} />
      <AppButton title={t('review.mistaken')} variant="secondary" onPress={() => router.push({ pathname: '/review/count', params: { mode: 'mistaken' } })} />
      <AppButton title={t('review.newest')} variant="secondary" onPress={() => router.push({ pathname: '/review/count', params: { mode: 'newest' } })} />
    </>}
  </Screen>;
}
