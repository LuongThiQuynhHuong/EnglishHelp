import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { ErrorState } from '@/components/common/ErrorState';
import { ReviewSummary } from '@/components/review/ReviewSummary';
import { useReviewSession } from '@/hooks/useReviewSession';
import { commonStyles } from '@/theme/styles';
import { spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';

export default function ReviewResultsScreen() {
  const { t } = useTranslation();
  const { result } = useReviewSession();
  if (!result) return <Screen header={<AppHeader title={t('review.results')} onLeadingPress={() => router.replace('/(tabs)/review')} />}><ErrorState message={t('review.noSession')} /></Screen>;
  return <Screen header={<AppHeader title={t('review.results')} />}><ReviewSummary result={result} />
    {result.answers.filter((entry) => entry.status !== 'correct').map(({ vocabulary, answer }) => <Pressable
      key={vocabulary.id}
      accessibilityRole="button"
      accessibilityLabel={t('reviewNavigation.openDetails', { word: vocabulary.word })}
      onPress={() => router.push({ pathname: '/vocabulary/[id]', params: { id: vocabulary.id } })}
      style={({ pressed }) => [commonStyles.card, styles.answer, pressed && styles.pressed]}
    >
      <AppText variant="subtitle">{t('review.correctWord')}: {vocabulary.word}</AppText>
      <AppText>{t('review.userAnswer')}: {answer || t('review.unanswered')}</AppText>
      <AppText>{t('review.vietnamese')}: {vocabulary.vietnameseMeaning}</AppText>
      <AppText>{t('review.english')}: {vocabulary.englishMeaning}</AppText>
    </Pressable>)}
    <AppButton title={t('review.tryAgain')} onPress={() => router.replace('/(tabs)/review')} />
  </Screen>;
}

const styles = StyleSheet.create({
  answer: { gap: spacing.sm },
  pressed: { opacity: 0.75 },
});
