import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { ErrorState } from '@/components/common/ErrorState';
import ReviewCountScreen from '@/screens/review/ReviewCountScreen';
import type { ReviewMode } from '@/models/Review';

export default function ReviewCountRoute() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const { t } = useTranslation();
  if (mode !== 'random' && mode !== 'mistaken' && mode !== 'newest') return <Screen><ErrorState message={t('app.error')} /></Screen>;
  return <ReviewCountScreen mode={mode as ReviewMode} />;
}
