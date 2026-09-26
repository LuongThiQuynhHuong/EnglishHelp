import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { ReviewResult } from '@/models/Review';
import { commonStyles } from '@/theme/styles';
import { spacing } from '@/theme/tokens';

export function ReviewSummary({ result }: { result: ReviewResult }) {
  const { t } = useTranslation();
  return <View style={[commonStyles.card, { gap: spacing.sm }]}><AppText>{t('review.total')}: {result.total}</AppText><AppText>{t('review.correct')}: {result.correct}</AppText><AppText>{t('review.incorrect')}: {result.incorrect}</AppText><AppText>{t('review.skipped')}: {result.skipped}</AppText><AppText variant="subtitle">{t('review.score')}: {result.percentage}%</AppText></View>;
}
