import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme/tokens';

export function ReviewProgress({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation();
  return <View style={{ gap: spacing.sm }}><AppText>{t('review.progress', { current, total })}</AppText><View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: current }} style={{ height: spacing.sm, backgroundColor: colors.border, borderRadius: radius.sm }}><View style={{ width: `${(current / total) * 100}%`, height: spacing.sm, backgroundColor: colors.primaryDark, borderRadius: radius.sm }} /></View></View>;
}
