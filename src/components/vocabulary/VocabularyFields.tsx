import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/common/FormField';
import { RemoteVocabularyImage } from './RemoteVocabularyImage';
import { isHttpUrl } from '@/utils/vocabularyValidation';

type Props = {
  word: string; onWordChange: (value: string) => void;
  vietnameseMeaning: string; onVietnameseChange: (value: string) => void;
  englishMeaning: string; onEnglishChange: (value: string) => void;
  imageUrl: string; onImageUrlChange: (value: string) => void;
  imageError?: string;
};

export function VocabularyFields(props: Props) {
  const { t } = useTranslation();
  const previewUrl = props.imageUrl.trim();
  return <>
    <FormField label={t('vocabulary.word')} value={props.word} onChangeText={props.onWordChange} autoCapitalize="none" autoCorrect={false} />
    <FormField label={t('vocabulary.vietnameseMeaning')} value={props.vietnameseMeaning} onChangeText={props.onVietnameseChange} multiline />
    <FormField label={t('vocabulary.englishMeaning')} value={props.englishMeaning} onChangeText={props.onEnglishChange} multiline />
    <FormField label={t('vocabulary.imageUrl')} value={props.imageUrl} onChangeText={props.onImageUrlChange} autoCapitalize="none" autoCorrect={false} keyboardType="url" error={props.imageError} />
    {previewUrl && isHttpUrl(previewUrl) ? <RemoteVocabularyImage url={previewUrl} /> : null}
  </>;
}
