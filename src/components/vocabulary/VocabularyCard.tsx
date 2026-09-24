import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { Vocabulary } from '@/models/Vocabulary';
import { commonStyles } from '@/theme/styles';
import { colors, spacing } from '@/theme/tokens';

export function VocabularyCard({ item, onPress }: { item: Vocabulary; onPress: () => void }) {
  const { t } = useTranslation();
  return <Pressable accessibilityRole="button" accessibilityLabel={item.word} onPress={onPress} style={({ pressed }) => [commonStyles.card, styles.card, pressed && styles.pressed]}>
    <View style={styles.row}><AppText variant="subtitle" style={styles.word}>{item.word}</AppText>{item.wordClass && <AppText muted>{t(`wordClasses.${item.wordClass}`)}</AppText>}</View>
    {item.ipa && <AppText>{item.ipa}</AppText>}
    <AppText muted>{t('vocabulary.vietnameseMeaning')}</AppText><AppText>{item.vietnameseMeaning}</AppText>
    <AppText muted>{t('vocabulary.englishMeaning')}</AppText><AppText>{item.englishMeaning}</AppText>
  </Pressable>;
}

const styles = StyleSheet.create({ card: { gap: spacing.xs, marginBottom: spacing.md, borderWidth: 0 }, row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'baseline' }, word: { color: colors.primaryDark }, pressed: { opacity: 0.75 } });
