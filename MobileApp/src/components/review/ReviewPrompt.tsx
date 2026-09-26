import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { RemoteVocabularyImage } from '@/components/vocabulary/RemoteVocabularyImage';
import type { Vocabulary } from '@/models/Vocabulary';
import { commonStyles } from '@/theme/styles';
import { spacing } from '@/theme/tokens';

export function ReviewPrompt({ word }: { word: Vocabulary }) {
  const { t } = useTranslation();
  return <><View style={[commonStyles.card, { gap: spacing.md }]}><AppText variant="subtitle">{t('review.vietnamese')}</AppText><AppText>{word.vietnameseMeaning}</AppText><AppText variant="subtitle">{t('review.english')}</AppText><AppText>{word.englishMeaning}</AppText></View>{word.imageUrl ? <RemoteVocabularyImage url={word.imageUrl} /> : null}</>;
}
