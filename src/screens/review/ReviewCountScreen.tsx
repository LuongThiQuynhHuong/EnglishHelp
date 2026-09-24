import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppButton } from '@/components/common/AppButton';
import { AppHeader } from '@/components/common/AppHeader';
import { FormField } from '@/components/common/FormField';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { useVocabularyList } from '@/hooks/useVocabularyList';
import { useReviewSession } from '@/hooks/useReviewSession';
import type { ReviewMode } from '@/models/Review';
import { REVIEW_COUNT_PRESETS } from '@/constants/defaults';
import { selectMostMistaken, selectNewest, selectRandom } from '@/services/review/reviewEngine';

export default function ReviewCountScreen({ mode }: { mode: ReviewMode }) {
  const { t } = useTranslation();
  const { items, loading, error, refresh } = useVocabularyList();
  const { start } = useReviewSession();
  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [invalid, setInvalid] = useState(false);

  function begin() {
    const count = preset ?? Number(custom);
    if (!Number.isSafeInteger(count) || count < 1 || count > items.length) { setInvalid(true); return; }
    const selected = mode === 'random' ? selectRandom(items, count) : mode === 'mistaken' ? selectMostMistaken(items, count) : selectNewest(items, count);
    start(mode, selected);
    router.push('/review/session');
  }

  return <Screen header={<AppHeader title={t('review.chooseCount')} />}>
    {loading ? <LoadingState label={t('app.loading')} /> : error ? <ErrorState message={t('app.error')} retryLabel={t('app.retry')} onRetry={() => void refresh()} /> : items.length === 0 ? <EmptyState message={t('review.noWords')} /> : <>
      {REVIEW_COUNT_PRESETS.filter((count) => count <= items.length).map((count) => <AppButton key={count} title={String(count)} variant={preset === count ? 'primary' : 'secondary'} onPress={() => { setPreset(count); setCustom(''); setInvalid(false); }} />)}
      <FormField label={t('review.customCount')} keyboardType="number-pad" value={custom} onChangeText={(value) => { setCustom(value); setPreset(null); setInvalid(false); }} error={invalid ? t('review.invalidCount', { max: items.length }) : undefined} />
      <AppButton title={t('review.start')} onPress={begin} />
    </>}
  </Screen>;
}
