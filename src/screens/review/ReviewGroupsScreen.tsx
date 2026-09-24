import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { useVocabularyList } from '@/hooks/useVocabularyList';
import { useSettings } from '@/hooks/useSettings';
import { useReviewSession } from '@/hooks/useReviewSession';
import { reviewGroups } from '@/services/review/reviewEngine';
import { DEFAULT_GROUP_SIZE } from '@/constants/defaults';

export default function ReviewGroupsScreen() {
  const { t } = useTranslation();
  const { items, loading, error, refresh } = useVocabularyList();
  const { settings } = useSettings();
  const { start } = useReviewSession();
  const groups = reviewGroups(items, settings?.reviewGroupSize ?? DEFAULT_GROUP_SIZE);
  return <Screen><AppButton title={t('app.back')} variant="secondary" onPress={() => router.back()} /><AppText variant="title">{t('review.selectGroup')}</AppText>
    {loading ? <LoadingState label={t('app.loading')} /> : error ? <ErrorState message={t('app.error')} retryLabel={t('app.retry')} onRetry={() => void refresh()} /> : groups.length === 0 ? <EmptyState message={t('review.noWords')} /> : groups.map((group) => <AppButton key={group.number} title={t('review.groupLabel', { group: group.number, start: group.start, end: group.end })} variant="secondary" onPress={() => { start('group', group.words); router.push('/review/session'); }} />)}
  </Screen>;
}
