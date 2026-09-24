import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/common/FormField';
import { RemoteVocabularyImage } from './RemoteVocabularyImage';
import { isHttpUrl } from '@/utils/vocabularyValidation';
import { WordClassPicker } from './WordClassPicker';
import type { WordClass } from '@/models/WordClass';
import { AppIcon } from '@/components/common/AppIcon';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

type Props = {
  word: string; onWordChange: (value: string) => void;
  wordClass: WordClass | null; onWordClassChange: (value: WordClass | null) => void;
  ipa: string; onIpaChange: (value: string) => void;
  vietnameseMeaning: string; onVietnameseChange: (value: string) => void;
  englishMeaning: string; onEnglishChange: (value: string) => void;
  imageUrl: string; onImageUrlChange: (value: string) => void;
  imageError?: string;
};

export function VocabularyFields(props: Props) {
  const { t } = useTranslation();
  const previewUrl = props.imageUrl.trim();
  return <>
    {previewUrl && isHttpUrl(previewUrl) ? <RemoteVocabularyImage url={previewUrl} /> : <View style={styles.image}><AppIcon name="imageAdd" size={72} /></View>}
    <FormField label={t('vocabulary.wordRequired')} value={props.word} onChangeText={props.onWordChange} autoCapitalize="none" autoCorrect={false} />
    <WordClassPicker value={props.wordClass} onChange={props.onWordClassChange} />
    <FormField label={t('vocabulary.vietnameseMeaningRequired')} value={props.vietnameseMeaning} onChangeText={props.onVietnameseChange} multiline />
    <FormField label={t('vocabulary.englishMeaningRequired')} value={props.englishMeaning} onChangeText={props.onEnglishChange} multiline />
    <FormField label={t('vocabulary.ipa')} value={props.ipa} onChangeText={props.onIpaChange} autoCapitalize="none" autoCorrect={false} />
    <FormField label={t('vocabulary.imageUrl')} value={props.imageUrl} onChangeText={props.onImageUrlChange} autoCapitalize="none" autoCorrect={false} keyboardType="url" error={props.imageError} />
  </>;
}
const styles = StyleSheet.create({ image: { width: 168, height: 168, borderWidth: 1, borderColor: colors.border, borderRadius: spacing.sm, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' } });
