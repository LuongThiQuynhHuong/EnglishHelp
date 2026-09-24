import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { Vocabulary } from '@/models/Vocabulary';
import { commonStyles } from '@/theme/styles';
import { spacing } from '@/theme/tokens';

export function VocabularyCard({ item, onPress }: { item: Vocabulary; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={item.word} onPress={onPress} style={({ pressed }) => [commonStyles.card, styles.card, pressed && styles.pressed]}><AppText variant="subtitle">{item.word}</AppText><AppText>{item.vietnameseMeaning}</AppText><AppText muted numberOfLines={2}>{item.englishMeaning}</AppText></Pressable>;
}

const styles = StyleSheet.create({ card: { gap: spacing.xs }, pressed: { opacity: 0.75 } });
