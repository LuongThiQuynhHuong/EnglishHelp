import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { ReviewSession } from '@/models/Review';
import { colors, dimensions, radius, spacing } from '@/theme/tokens';
import { normalizeAnswer } from '@/utils/answerNormalization';

type Props = { session: ReviewSession; disabled?: boolean; onSelect: (index: number) => void };
type WordState = 'current' | 'answered' | 'pending' | 'unvisited';

export function ReviewWordNavigation({ session, disabled = false, onSelect }: Props) {
  const { t } = useTranslation();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} accessibilityRole="tablist">
    {session.questions.map((question, index) => {
      const state = getWordState(session, question.id, index);
      return <Pressable
        key={question.id}
        accessibilityRole="tab"
        accessibilityLabel={t('reviewNavigation.label', { number: index + 1, state: t(`reviewNavigation.state.${state}`) })}
        accessibilityState={{ selected: state === 'current', disabled }}
        disabled={disabled}
        onPress={() => onSelect(index)}
        style={({ pressed }) => [styles.button, styles[state], pressed && styles.pressed]}
      >
        <AppText style={[styles.label, state === 'current' && styles.currentLabel, state === 'pending' && styles.pendingLabel]}>{index + 1}</AppText>
      </Pressable>;
    })}
  </ScrollView>;
}

function getWordState(session: ReviewSession, wordId: string, index: number): WordState {
  if (index === session.currentIndex) return 'current';
  if (normalizeAnswer(session.answers[wordId] ?? '')) return 'answered';
  if (Object.prototype.hasOwnProperty.call(session.answers, wordId)) return 'pending';
  return 'unvisited';
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingVertical: spacing.xs },
  button: { width: dimensions.touchTarget, height: dimensions.touchTarget, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  current: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  answered: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  pending: { backgroundColor: colors.dangerSurface, borderColor: colors.danger },
  unvisited: { backgroundColor: colors.surface, borderColor: colors.border },
  label: { fontWeight: '700' },
  currentLabel: { color: colors.surface },
  pendingLabel: { color: colors.danger },
  pressed: { opacity: 0.7 },
});
