import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { RemoteVocabularyImage } from '@/components/vocabulary/RemoteVocabularyImage';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useSettings } from '@/hooks/useSettings';
import type { Vocabulary } from '@/models/Vocabulary';
import { formatDate } from '@/utils/dateFormat';
import { commonStyles } from '@/theme/styles';
import { colors, spacing } from '@/theme/tokens';
import { openDictionary, type Dictionary } from '@/services/dictionary/dictionaryLinks';
import { AppHeader } from '@/components/common/AppHeader';

export default function VocabularyDetailScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const repository = useVocabulary();
  const { settings } = useSettings();
  const [item, setItem] = useState<Vocabulary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true); setError(false);
    try { setItem(await repository.get(id)); }
    catch (cause) { if (__DEV__) console.error('Vocabulary detail failed', cause); setError(true); }
    finally { setLoading(false); }
  }, [id, repository]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  function confirmDelete() {
    Alert.alert(t('vocabulary.deleteTitle'), t('vocabulary.deleteMessage'), [
      { text: t('app.cancel'), style: 'cancel' },
      { text: t('app.delete'), style: 'destructive', onPress: () => { void repository.delete(id).then(() => router.replace('/(tabs)')).catch((cause: unknown) => { if (__DEV__) console.error('Vocabulary delete failed', cause); Alert.alert(t('app.error'), t('vocabulary.deleteError')); }); } },
    ]);
  }

  async function lookup(dictionary: Dictionary) {
    if (!item) return;
    try { await openDictionary(dictionary, item.word); }
    catch (cause) { if (__DEV__) console.error('Dictionary opening failed', cause); Alert.alert(t('app.error'), t('dictionary.openError')); }
  }

  const fallbackHeader = <AppHeader title={t('vocabulary.title')} />;
  if (loading) return <Screen header={fallbackHeader}><LoadingState label={t('app.loading')} /></Screen>;
  if (error) return <Screen header={fallbackHeader}><ErrorState message={t('app.error')} retryLabel={t('app.retry')} onRetry={() => void refresh()} /></Screen>;
  if (!item) return <Screen header={fallbackHeader}><ErrorState message={t('vocabulary.notFound')} /></Screen>;
  const header = <AppHeader title={item.word} actions={[
    { icon: 'review', label: t('app.edit'), onPress: () => router.push({ pathname: '/vocabulary/[id]/edit', params: { id } }) },
    { icon: 'delete', label: t('app.delete'), color: colors.danger, onPress: confirmDelete },
  ]} />;
  return <Screen header={header}>
    {item.wordClass && <AppText variant="subtitle">{t(`wordClasses.${item.wordClass}`)}</AppText>}{item.ipa && <AppText>{item.ipa}</AppText>}
    <RemoteVocabularyImage url={item.imageUrl} />
    <View style={[commonStyles.card, { gap: spacing.sm }]}><AppText variant="subtitle">{t('vocabulary.vietnameseMeaning')}</AppText><AppText>{item.vietnameseMeaning}</AppText><AppText variant="subtitle">{t('vocabulary.englishMeaning')}</AppText><AppText>{item.englishMeaning}</AppText></View>
    <View style={[commonStyles.card, { gap: spacing.sm }]}><AppText>{t('vocabulary.dateAdded')}: {formatDate(item.createdAt, settings?.language ?? 'en')}</AppText><AppText>{t('vocabulary.reviewCount')}: {item.reviewCount}</AppText><AppText>{t('vocabulary.correctCount')}: {item.correctCount}</AppText><AppText>{t('vocabulary.incorrectCount')}: {item.incorrectCount}</AppText></View>
    <AppButton title={t('vocabulary.openOxford')} variant="secondary" onPress={() => void lookup('oxford')} />
    <AppButton title={t('vocabulary.openCambridge')} variant="secondary" onPress={() => void lookup('cambridge')} />
  </Screen>;
}
