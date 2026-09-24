import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { VocabularyFields } from '@/components/vocabulary/VocabularyFields';
import { useVocabulary } from '@/hooks/useVocabulary';
import { validateVocabularyInput } from '@/utils/vocabularyValidation';
import { colors } from '@/theme/tokens';

export default function VocabularyFormScreen({ id }: { id?: string }) {
  const { t } = useTranslation();
  const repository = useVocabulary();
  const [word, setWord] = useState('');
  const [vietnameseMeaning, setVietnameseMeaning] = useState('');
  const [englishMeaning, setEnglishMeaning] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void repository.get(id).then((item) => {
      if (!active) return;
      if (!item) { setLoadError(true); return; }
      setWord(item.word); setVietnameseMeaning(item.vietnameseMeaning); setEnglishMeaning(item.englishMeaning); setImageUrl(item.imageUrl ?? '');
    }).catch((cause: unknown) => { if (__DEV__) console.error('Vocabulary load failed', cause); if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, repository]);

  async function save() {
    const input = { word, vietnameseMeaning, englishMeaning, imageUrl: imageUrl || null };
    const invalid = validateVocabularyInput(input);
    if (invalid) { setValidationError(invalid); return; }
    setValidationError(null); setSaving(true);
    try {
      const saved = id ? await repository.update(id, input) : await repository.create(input);
      router.replace({ pathname: '/vocabulary/[id]', params: { id: saved.id } });
    } catch (cause) {
      if (__DEV__) console.error('Vocabulary save failed', cause);
      const message = cause instanceof Error && cause.message === 'duplicate' ? t('vocabulary.duplicate') : t('vocabulary.saveError');
      Alert.alert(t('app.error'), message);
    } finally { setSaving(false); }
  }

  if (loading) return <Screen><LoadingState label={t('app.loading')} /></Screen>;
  if (loadError) return <Screen><ErrorState message={t('vocabulary.notFound')} /></Screen>;
  return <Screen><AppButton title={t('app.back')} variant="secondary" onPress={() => router.back()} /><AppText variant="title">{id ? t('app.edit') : t('vocabulary.add')}</AppText>
    <VocabularyFields word={word} onWordChange={setWord} vietnameseMeaning={vietnameseMeaning} onVietnameseChange={setVietnameseMeaning} englishMeaning={englishMeaning} onEnglishChange={setEnglishMeaning} imageUrl={imageUrl} onImageUrlChange={setImageUrl} imageError={validationError === 'invalidImageUrl' ? t('vocabulary.invalidImageUrl') : undefined} />
    {validationError === 'required' ? <AppText style={{ color: colors.danger }}>{t('vocabulary.required')}</AppText> : null}
    <AppButton title={t('app.save')} onPress={() => void save()} disabled={saving} />
  </Screen>;
}
