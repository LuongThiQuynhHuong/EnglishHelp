import { View } from 'react-native';
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

export default function ReviewResultsScreen() {
  const { t } = useTranslation();
  const { result } = useReviewSession();
  if (!result) return <Screen><ErrorState message={t('review.noSession')} /><AppButton title={t('app.back')} onPress={() => router.replace('/(tabs)/review')} /></Screen>;
  return <Screen><AppText variant="title">{t('review.results')}</AppText><ReviewSummary result={result} />
    {result.answers.filter((entry) => entry.status === 'incorrect').map(({ vocabulary, answer }) => <View key={vocabulary.id} style={[commonStyles.card, { gap: spacing.sm }]}>
      <AppText variant="subtitle">{t('review.correctWord')}: {vocabulary.word}</AppText>
      <AppText>{t('review.userAnswer')}: {answer}</AppText>
      <AppText>{t('review.vietnamese')}: {vocabulary.vietnameseMeaning}</AppText>
      <AppText>{t('review.english')}: {vocabulary.englishMeaning}</AppText>
    </View>)}
    <AppButton title={t('review.tryAgain')} onPress={() => router.replace('/(tabs)/review')} />
  </Screen>;
}
