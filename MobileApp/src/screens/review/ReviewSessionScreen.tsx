import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppButton } from '@/components/common/AppButton';
import { AppHeader } from '@/components/common/AppHeader';
import { FormField } from '@/components/common/FormField';
import { ErrorState } from '@/components/common/ErrorState';
import { ReviewPrompt } from '@/components/review/ReviewPrompt';
import { ReviewWordNavigation } from '@/components/review/ReviewWordNavigation';
import { useReviewSession } from '@/hooks/useReviewSession';
import { spacing } from '@/theme/tokens';

export default function ReviewSessionScreen() {
  const { t } = useTranslation();
  const { session, submitting, setAnswer, moveTo, skip, submit } = useReviewSession();

  if (!session) return <Screen header={<AppHeader title={t('review.title')} onLeadingPress={() => router.replace('/(tabs)/review')} />}><ErrorState message={t('review.noSession')} /></Screen>;
  const question = session.questions[session.currentIndex];

  function confirmSubmit() {
    Alert.alert(t('review.submitTitle'), t('review.submitMessage'), [
      { text: t('app.cancel'), style: 'cancel' },
      { text: t('review.submit'), onPress: () => { void submit().then(() => router.replace('/review/results')).catch((cause: unknown) => { if (__DEV__) console.error('Review submission failed', cause); Alert.alert(t('app.error'), t('review.submitError')); }); } },
    ]);
  }

  return <Screen header={<AppHeader title={t('review.title')} />}>
    <ReviewWordNavigation session={session} disabled={submitting} onSelect={moveTo} />
    <ReviewPrompt word={question} />
    <FormField label={t('review.yourAnswer')} value={session.answers[question.id] ?? ''} onChangeText={setAnswer} autoCapitalize="none" autoCorrect={false} editable={!submitting} />
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <AppButton title={t('review.previous')} variant="secondary" onPress={() => moveTo(session.currentIndex - 1)} disabled={submitting || session.currentIndex === 0} style={{ flex: 1 }} />
      <AppButton title={t('review.skip')} variant="secondary" onPress={skip} disabled={submitting} style={{ flex: 1 }} />
      <AppButton title={t('review.next')} variant="secondary" onPress={() => moveTo(session.currentIndex + 1)} disabled={submitting || session.currentIndex === session.questions.length - 1} style={{ flex: 1 }} />
    </View>
    <AppButton title={t('review.submit')} onPress={confirmSubmit} disabled={submitting} />
  </Screen>;
}
